import { Category } from "./Category";
import Command from "../Command";
import { CommandData } from "../CommandData";
import { Database } from "../../Modules/Database/Connection";
import fetch from "node-fetch"; // Use fetch for HTTP requests

export class Feed extends Category {
    name = "feed";
    commands = [
        new Command({
            permission: "user.invite",
            name: "block",
            callback: async (data: CommandData) => {
                await data.embedder.Update("Checking");

                var post = data.args[1]; // The post URL
                var feed = null; // no specified feed = both
                if (data.args.length > 2) feed = data.args[2];

                var did = await this.fetchDidFromPost(post);

                if (!did || did.length < 10) {
                    data.embedder.Update("Aborting due to incorrect DID `" + did + "`");
                    return;
                } else {
                    data.embedder.Update("Blocking DID `" + did + "`");
                }

                if (feed == null || feed == "osu") {
                    const blockedResult = await Database.Connection.db.execute("UPDATE `osu-users` SET blocked = 1 WHERE did = ?", [did]);
                    const blockedCount = blockedResult[0]?.info || 0; // Use 'changes' to get affected rows
                    data.embedder.Update("[osu] Blocked users: " + blockedCount);

                    const deletedResult = await Database.Connection.db.execute("DELETE FROM `osu-post` WHERE uri LIKE ?", ["at://" + did + "%"]);
                    const deletedCount = deletedResult[0]?.affectedRows || 0;
                    data.embedder.Update("[osu] Deleted posts: " + deletedCount);
                }

                if (feed == null || feed == "protogen") {
                    const blockedResult = await Database.Connection.db.execute("UPDATE `users` SET blocked = 1 WHERE did = ?", [did]);
                    const blockedCount = blockedResult[0]?.info || 0;
                    data.embedder.Update("[protogen] Blocked users: " + blockedCount);

                    const deletedResult = await Database.Connection.db.execute("DELETE FROM `post` WHERE uri LIKE ?", ["at://" + did + "%"]);
                    const deletedCount = deletedResult[0]?.affectedRows || 0;
                    data.embedder.Update("[protogen] Deleted posts: " + deletedCount);
                }

            }
        }),
        new Command({
            permission: "user.invite",
            name: "remove",
            callback: async (data: CommandData) => {
                await data.embedder.Update("Checking");

                var post = data.args[1]; // The post URL
                if (post.startsWith('<') && post.endsWith('>')) {
                    post = post.slice(1, -1);
                }

                var feed = null; // no specified feed = both
                if (data.args.length > 2) feed = data.args[2];

                var did = await this.fetchDidFromPost(post) + "/app.bsky.feed.post/" + post.split("/").at(-1);

                await data.embedder.Update(did + "?");


                if (feed == null || feed == "osu") {
                    const deletedResult = await Database.Connection.db.execute("DELETE FROM `osu-post` WHERE uri LIKE ?", ["%" + did]);
                    const deletedCount = deletedResult[0]?.affectedRows || 0;
                    data.embedder.Update("[osu] Deleted posts: " + deletedCount);
                }

                if (feed == null || feed == "protogen") {
                    const deletedResult = await Database.Connection.db.execute("DELETE FROM `post` WHERE uri LIKE ?", ["%" + did]);
                    const deletedCount = deletedResult[0]?.affectedRows || 0;
                    data.embedder.Update("[protogen] Deleted posts: " + deletedCount);
                }

            }
        })
    ];

    /**
     * Fetch the DID from a post URL using the Bluesky API.
     * @param postUrl The post URL to fetch the DID for.
     * @returns The DID as a string.
     */
    async fetchDidFromPost(postUrl: string): Promise<string> {
        try {
            const urlParts = postUrl.split('/');
            const handle = urlParts[4];
            const postId = urlParts[6];

            const response = await fetch(
              `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`
            );
            const handleData = await response.json();

            if (!handleData.did) throw new Error("Failed to fetch DID from handle.");

            return handleData.did;
        } catch (error) {
            console.error("Error fetching DID:", error);
            return "";
        }
    }

}

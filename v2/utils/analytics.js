import db from "./database.js";

export async function PushAnalytic(user, feed) {
    await db.execute(`INSERT INTO \`analytics\` (\`feed\`, \`user\`, \`time\`)
VALUES (?, ?, now());`, [feed, user])
}

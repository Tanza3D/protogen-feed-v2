import {CommandCategories} from "./Commands";
import env from "../Modules/Env";

// @ts-ignore
import {Channel, Client, GatewayIntentBits, Guild, TextChannel} from "discord.js";
import {CommandParser} from "./CommandParser";
import {CommandData} from "./CommandData";
import {Category} from "./Categories/Category";
import Command from "./Command";
import {Embedder} from "./Embedder";

export class BotIO {
    static client: Client = null;

    static GetChannel(key: string): TextChannel | undefined {
        const guild: Guild | undefined = this.client.guilds.cache.get(env.bot.server);
        if (!guild) {
            console.error("guild does not exist");
            return null;
        }

        return guild.channels.cache.find(channel => channel.name === key) as TextChannel | undefined;
    }
}

export class Bot {
    constructor() {

    }

    Init() {
        return new Promise(async (resolve, reject) => {
            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMembers,
                    GatewayIntentBits.GuildBans,
                    GatewayIntentBits.GuildEmojisAndStickers,
                    GatewayIntentBits.GuildIntegrations,
                    GatewayIntentBits.GuildWebhooks,
                    GatewayIntentBits.GuildInvites,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.GuildMessageReactions,
                    GatewayIntentBits.GuildMessageTyping,
                    GatewayIntentBits.DirectMessages,
                    GatewayIntentBits.DirectMessageReactions,
                    GatewayIntentBits.DirectMessageTyping,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildScheduledEvents
                ]
            });
            BotIO.client = client;

            client.on('ready', () => {
                console.log(`Logged in as ${client.user.tag}!`);
                resolve(true);
            });

            client.on('messageCreate', async (message)  => {
                if (!message.content.startsWith("$")) return;
                if (message.author == client.user) {
                    console.log(message.author.id + ":" + client.user.id)
                    return;
                }
                console.log("!");
                if(message.author.id !== "494883957117288448" && message.author.id !== "233170527458426880") {
                    return;
                }

                var [args, flags] = CommandParser(message.content);
                var commandData: CommandData = new CommandData(message, args, flags);

                var commandName = null;
                if (args[0].startsWith("$")) {
                    commandName = args[0].substring(1).split(".");
                } else {
                    return;
                }


                var command: Command = null;

                for (var category of CommandCategories) {
                    if (category.name == commandName[0]) {
                        for (var icommand of category.commands) {
                            if (icommand.name == commandName[1]) {
                                command = icommand;

                            }
                        }
                    }
                }

                if (command == null) {
                    message.reply("Could not find " + commandName.join("."));
                } else {
                    var embedder = new Embedder();
                    await embedder.Create(commandData);
                    await command.callback(commandData);
                }
            });


            try {
                await client.login(env.bot.token);
            } catch (error) {
                reject(error); // Reject the promise if login fails
            }


            console.log(CommandCategories);
        });
    }

    sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

}
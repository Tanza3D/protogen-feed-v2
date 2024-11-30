// @ts-ignore
import {Embed, EmbedBuilder, Message} from "discord.js";
import {CommandData} from "./CommandData";

export class Embedder {
    embedText : string = "";
    embed = null;
    emessage : Message = null;
    constructor() {

    }
    async Create(data : CommandData) {
        this.embed = new EmbedBuilder();
        data.embedder = this;

        this.embed.setTitle("Running " + data.args[0])
        this.embed.setDescription("...");

        this.emessage = await data.message.reply({ embeds: [this.embed] });
    }

    async Update(line : string, override : boolean = false, colour : number = 0xFFFFFF) {
        if(override) this.embedText = "";
        this.embedText += "\n";
        this.embedText += line;
        this.embed.setDescription(this.embedText);
        this.embed.setColor(colour);
        if(line == "Done!") {
            this.embed.setColor(0x0000FF);
        }
        await this.emessage.edit({ embeds: [this.embed] });
    }
}
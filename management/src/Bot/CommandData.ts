// @ts-ignore
import {Message, MessageActionRowComponentResolvable} from "discord.js";
import {Embedder} from "./Embedder";

export class CommandData {
    message : Message;
    args;
    flags;
    embedder : Embedder = null;
    constructor(message: Message, args, flags) {
        this.message = message;
        this.args = args;
        this.flags = flags;
    }
}
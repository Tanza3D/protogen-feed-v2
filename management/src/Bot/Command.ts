import {CommandData} from "./CommandData";

export default class Command {
    permission;
    name;
    callback;
    constructor({permission = "any", name, callback = (data : CommandData) => {}}) {
        this.permission = permission;
        this.name = name;
        this.callback = callback;
    }
}
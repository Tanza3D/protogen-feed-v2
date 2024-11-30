import {Database} from "./Modules/Database/Connection";
import {Bot} from "./Bot/Bot";

const dbConnection = new Database.Connection();

async function Run() {
    var bot = new Bot();
    await bot.Init();
}

Run();
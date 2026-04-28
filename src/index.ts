import {Telegraf} from "telegraf";
import {handleCommands} from "./utils/handleCommands.ts";
import {awaitMessageMiddleware} from "./utils/awaitMessage.ts";

const bot = new Telegraf(process.env.TOKEN!)

try {
    bot.use(awaitMessageMiddleware)

    await handleCommands(bot);
} catch (e) {
    console.error(e)
}

await bot.launch()
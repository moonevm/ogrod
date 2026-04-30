import {Telegraf} from "telegraf";
import {handleCommands} from "./utils/handlers/handleCommands.ts";
import {awaitMessageMiddleware} from "./utils/awaitMessage.ts";
import {sendWeatherInformation} from "./utils/cron/sendWeatherInformation.ts";
import {handleButtons} from "./utils/handlers/handleButtons.ts";

const bot = new Telegraf(process.env.TOKEN!)

try {
    bot.use(awaitMessageMiddleware)

    await handleCommands(bot);
    await handleButtons(bot)
    await sendWeatherInformation(bot)
} catch (e) {
    console.error(e)
}

await bot.launch()
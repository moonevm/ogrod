import {Telegraf} from "telegraf";
import {handleCommands} from "./utils/handlers/handleCommands.ts";
import {awaitMessageMiddleware} from "./utils/awaitMessage.ts";
import {handleButtons} from "./utils/handlers/handleButtons.ts";
import { captureExceptionWithMetadata } from "./utils/sentry.ts";
import {handleCronSchedules} from "./utils/handlers/handleCronSchedules.ts";

const bot = new Telegraf(process.env.TOKEN!)

try {
    bot.use(awaitMessageMiddleware)

    await handleCommands(bot);
    await handleButtons(bot)
    await handleCronSchedules(bot);
} catch (e) {
    await captureExceptionWithMetadata(e, {
        location: "index.ts:main-initialization",
    })
    console.error(e)
}

await bot.launch()
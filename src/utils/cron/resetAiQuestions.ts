import {CronJob} from "cron";
import {Telegraf} from "telegraf";
import {prisma} from "../prisma.ts";

export async function resetAiQuestions(bot: Telegraf) {
    new CronJob(
        "55 14 1 * *",
        async function () {
            await prisma.user.updateMany({ data: { aiQuestions: 10 } })
        },
        null,
        true,
        "Europe/Berlin"
    )
}
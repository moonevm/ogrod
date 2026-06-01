import {CronJob} from "cron";
import {Telegraf} from "telegraf";
import {prisma} from "../prisma.ts";

export default async function resetAiQuestions(bot: Telegraf) {
    new CronJob(
        "55 8 1 * *",
        async function () {
            console.log("reset")
            await prisma.user.updateMany({ data: { aiQuestions: 10 } })
        },
        null,
        true,
        "Europe/Berlin"
    )
}
import {CronJob} from "cron";
import {Markup, Telegraf} from "telegraf";
import {prisma} from "../prisma.ts";

export default async function resetAiQuestions(bot: Telegraf) {
    new CronJob(
        "0 0 * * 0",
        async function () {
            const users = await prisma.user.findMany({})
            for (const user of users) {
                const weatherLog = await prisma.weatherLog.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
                if (!weatherLog) return

                await bot.telegram.deleteMessage(Number(user.userId), Number(user.latestMessageId))

                const latestMessage = await bot.telegram.sendMessage(
                    Number(user.userId),
                    weatherLog.message + "\n\n" + "<b>🙋‍Zresetowane Pytania</b>",
                    {
                        parse_mode: "HTML",
                        ...Markup.inlineKeyboard([
                            { text: `🤖 Zapytaj się SI (10)`, callback_data: "askai_" + weatherLog.id }
                        ])
                    }
                )

                await bot.telegram.sendMessage(
                    Number(user.userId),
                    "<b>Pytania zresetowane 🚀</b>",
                    {
                        parse_mode: "HTML",
                    }
                )

                await prisma.user.update({ data: { aiQuestions: 10, latestMessageId: latestMessage.message_id }, where: { id: user.id } })
            }
        },
        null,
        true,
        "Europe/Berlin"
    )
}

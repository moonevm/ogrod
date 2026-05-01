import {type Context, Markup} from "telegraf";
import {prisma} from "../../utils/prisma.ts";

export const name = /^askaiback_(.+)$/

export async function handler(ctx: Context) {
    await ctx.answerCbQuery()
    const id = (ctx.callbackQuery as any).data

    const weatherLog = await prisma.weatherLog.findFirst({ where: { id: id.split("_")[1] } })
    if (!weatherLog) return


    ctx.editMessageText(weatherLog.message, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
            { text: "🤖 Zapytaj się SI", callback_data: "askai_" + weatherLog.id }
        ])
    })
}
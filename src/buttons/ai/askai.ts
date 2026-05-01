import {type Context, Markup} from "telegraf";
import {awaitMessage} from "../../utils/awaitMessage.ts";
import axios from "axios";
import {openai} from "../../utils/openai.ts";
import {toFile} from "openai";
import {prisma} from "../../utils/prisma.ts";
import {formatWeatherData} from "../../utils/weather/formatWeatherData.ts";
import getWeatherData from "../../utils/weather/getWeatherData.ts";
import { captureExceptionWithMetadata } from "../../utils/sentry.ts";

export const name = /^askai_(.+)$/

export async function handler(ctx: Context) {
    await ctx.answerCbQuery()
    const id = (ctx.callbackQuery as any).data
    const message: any = ctx.callbackQuery!.message

    const cancel = async () => {
        await ctx.editMessageText(message.text, {
            entities: message.entities,
            reply_markup: message.reply_markup,
        })
    }

    const user = await prisma.user.findFirst({ where: { userId: ctx.from!.id } })
    if (!user) return

    const weatherLog = await prisma.weatherLog.findFirst({ where: { id: id.split("_")[1] } })
    if (!weatherLog) return

    await ctx.editMessageText("<b>🤖 Pytania do SI</b>\n\nNapisz swoje pytanie na czacie, aby zapytać SI.", {
        parse_mode: "HTML",
    })

    try {
        const answer = await awaitMessage(ctx.from!.id)

        let message = (answer.interaction.message as any).text
        const voice = (answer.interaction.message as any).voice

        if (voice) {
           try {
               await ctx.editMessageText("🔵 Transkrybuje nagranie...", {
                   parse_mode: "HTML"
               })
               const fileLink = await ctx.telegram.getFileLink(voice.file_id)

               const response = await axios({ url: fileLink.href, responseType: "arraybuffer" });
               const buffer = Buffer.from(response.data);

               const transcription = await openai.audio.transcriptions.create({
                   file: await toFile(buffer, "voice.ogg", { type: "audio/ogg" }),
                   model: "whisper-1",
               });

               message = transcription.text
           } catch (e) {
               await captureExceptionWithMetadata(e, {
                   location: "buttons/ai/askai.ts:voice-transcription",
                   telegrafContext: ctx,
                   extra: { userId: ctx.from?.id, voiceFileId: voice.file_id },
               })
               await cancel()
               return await ctx.reply("🔴 Coś poszło nie tak")
           }
        }

        await ctx.editMessageText("🟠 Myślenie...", {
            parse_mode: "HTML"
        })

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions: `
                You are a weather assistant for a Telegram bot. Your job is to answer the user's questions using ONLY the weather data provided to you in this conversation.

                STRICT RULES:
                1. Only use data that has been explicitly provided. Never invent, estimate, or extrapolate temperatures, conditions, humidity, wind speed, or any other weather values.
                2. If the user asks about a time period, location, or metric that isn't in the provided data, tell them clearly and honestly that you don't have that information.
                3. Do not say things like "it's likely" or "it probably" when referring to missing data — just say you don't have it.
                4. You can do simple, obvious comparisons and reading of the data (e.g. "which day is warmest", "best day to grill"). You may also do basic calculations like finding the highest or lowest value in the data. Do NOT do complex math like averages, percentage changes, or multi-step formulas.
                5. Always reply in the same language the user wrote in. If the user writes in Polish, reply in Polish. If German, reply in German. Match their language every time, no exceptions.
                6. Always format dates as DD.MM.YYYY (e.g. 03.05.2026). Never use ISO format (YYYY-MM-DD) or any other date format.
                7. Format your responses using Telegraf HTML markup only. Use <b>text</b> for bold, <i>text</i> for italic, <code>text</code> for code. Do not use Markdown syntax like **bold**, *italic*, or backtick code blocks.

                TONE:
                - Be conversational and helpful, not robotic.
                - Keep answers short and to the point unless the user asks for detail.
                - If you can partially answer a question, do so and clearly note what part you couldn't answer due to missing data.

                 Today is the ${new Date().toLocaleDateString("pl-PL")}

                --- WEATHER DATA ---
                ${formatWeatherData(weatherLog.weatherData)}
                --- END OF WEATHER DATA ---
            `,
            input: message
        })

        await ctx.editMessageText(`<b>🤖 Odpowiedź SI</b>\n\n<code>${response.output_text}</code>`, {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
                { text: "🧑‍🌾 Powrót", callback_data: `askaiback_${id.split("_")[1]}` }
            ])
        })
    } catch (e) {
        if (e === "Replaced") return
        if (e !== "Timeout" && e !== "User Cancelled") {
            await captureExceptionWithMetadata(e, {
                location: "buttons/ai/askai.ts:main-handler",
                telegrafContext: ctx,
                extra: { userId: ctx.from?.id, weatherLogId: id.split("_")[1] },
            })
        }
        return cancel()
    }
}

import {CronJob} from "cron";
import getWeatherData from "../getWeatherData.ts";
import {prisma} from "../prisma.ts";
import {Telegraf} from "telegraf";
import {getEmojiForValue} from "../getEmojiForValue.ts";

const temperatureThresholds = [
    { max: 0, emoji: "🧊" },
    { max: 10, emoji: "🥶" },
    { max: 15, emoji: "🌤" },
    { max: 20, emoji: "☀️" },
    { max: 25, emoji: "🔥" },
    { max: Infinity, emoji: "🏜️" },
]

const windThresholds =[
    { max: 10, emoji: "🍃" },
    { max: 25, emoji: "💨" },
    { max: 40, emoji: "🛩️" },
    { max: Infinity, emoji: "🌀" },
]

const uvThresholds = [
    { max: 2, emoji: "☀️" },
    { max: 5, emoji: "🧴" },
    { max: 7, emoji: "⛱️" },
    { max: 10, emoji: "🔥" },
    { max: Infinity, emoji: "☠️" },
]

export async function sendWeatherInformation(bot: Telegraf) {
    new CronJob(
        "0 6,9,15,19,20 * * *",
        async function () {
            const users = await prisma.user.findMany({ where: { active: true } })
            if (users.length == 0) return

            const weatherData = await getWeatherData({ summarize: true });

            const latestMessageIdMap = new Map<string, number>();

            for (const user of users) {
                try {
                    await bot.telegram.deleteMessage(Number(user.userId), Number(user.latestMessageId))
                } catch (e) {}

                const breakpoints = [7, 12, 18, 20, 23]

                try {
                    const message = await bot.telegram.sendMessage(Number(user.userId),
                        `<b>🧑‍🌾 Informacja Pogodowa</b>\n\n`+
                        `🌤️<b>Zachód Słońca:</b> ${new Date(weatherData.daily.sunset[0]!).toLocaleTimeString("pl-PL",  { hour: "2-digit", minute: "2-digit" })}\n`+
                        `⛅️<b>Wschód Słońca (jutro):</b> ${new Date(weatherData.daily.sunrise[1]!).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}\n\n`+
                        `${getEmojiForValue(weatherData.daily.uv_index_max[0]!, uvThresholds)}️<b>Indeks UV:</b> ${weatherData.daily.uv_index_max[0]} ${weatherData.daily.units.uv_index_max}\n\n`+
                        `${getEmojiForValue(weatherData.current.wind_speed, windThresholds)}️<b>Prędkość Wiatru:</b> ${weatherData.current.wind_speed} ${weatherData.current.units.wind_speed_10m}\n\n`+
                        `🌡️ <b>Temperatura:</b>\n\n`+
                        `     ${getEmojiForValue(weatherData.current.temperature, temperatureThresholds)} <b>Teraz (${new Date().toLocaleTimeString("pl-PL", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" })}):</b> ${weatherData.current.temperature} ${weatherData.current.units.temperature_2m}\n\n` +

                        breakpoints.map((e) => {
                            const time = weatherData.hourly.time.indexOf(new Date(new Date().setHours(e, 0, 0, 0)).toISOString().slice(0, 16))


                            return `     <b>${getEmojiForValue(weatherData.hourly.temperature[time]!, temperatureThresholds)} ${e.toString().padStart(2, "0")}:00:</b> ${weatherData.hourly.temperature[time]} ${weatherData.hourly.units.temperature_2m}`
                        }).join("\n")+

                        `\n\n📰 <b>Podsumowanie SI:</b>\n`+
                        `<code>${weatherData.summary}</code>`,

                        {
                            parse_mode: "HTML"
                        }
                    )

                    latestMessageIdMap.set(user.id, message.message_id)
                } catch {
                    await prisma.user.update({ where: { id: user.id }, data: { active: false } })
                }
            }

            await prisma.$transaction(
                Array.from(latestMessageIdMap.entries()).map(([userId, messageId]) =>
                    prisma.user.update({
                        where: { id: userId },
                        data: { latestMessageId: messageId },
                    })
                )
            );
        },
        null,
        true,
        "Europe/Berlin"
    )
}
import axios from "axios"
import {openai} from "./openai.ts";

export default async function getWeatherData({ summarize = false }: { summarize?: boolean }) {
    const data = (await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${process.env.LOCATION!.split(":")[0]}&longitude=${process.env.LOCATION!.split(":")[1]}&daily=sunrise,sunset,uv_index_max,rain_sum&hourly=temperature_2m&current=temperature_2m,wind_speed_10m&timezone=auto&past_days=0&forecast_days=7`)).data

    let summary = ""

    if (summarize) {
        summary = (await openai.responses.create({
            model: "gpt-4o",
            instructions: `summarize the weather in 3-4 sentences in polish. today is the ${new Date()} do not use em dashes, do not include the city name just summarize the weather. include what outdoor activities would be great to do or not great to do depending on the weather`,
            input: JSON.stringify(data),
        })).output_text
    }

    return {
        current: {
            units:  data.current_units,
            temperature: data.current.temperature_2m,
            wind_speed: data.current.wind_speed_10m,
        },
        daily: {
            units: data.daily_units,
            sunrise: data.daily.sunrise,
            sunset: data.daily.sunset,
            uv_index_max: data.daily.uv_index_max,
            rain_sum: data.daily.rain_sum
        },
        hourly: {
            time: data.hourly.time,
            units: data.hourly_units,
            temperature: data.hourly.temperature_2m,
        },
        summary
    }
}
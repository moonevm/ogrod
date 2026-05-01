import axios from "axios"
import {openai} from "./openai.ts";

export default async function getWeatherData({ summarize = false }: { summarize?: boolean }) {
    const data = (await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${process.env.LOCATION!.split(":")[0]}&longitude=${process.env.LOCATION!.split(":")[1]}&daily=sunrise,sunset,uv_index_max,rain_sum&hourly=temperature_2m&current=temperature_2m,wind_speed_10m&timezone=auto&past_days=0&forecast_days=7`)).data

    let summary = ""

    if (summarize) {
        summary = (await openai.responses.create({
            model: "gpt-4o-mini",
            instructions: `
                You are a witty, observant local who knows this city intimately. Summarize today's weather in Polish in 3-4 sentences. Today's date and time is: ${new Date()}.
                
                Weather data: [INSERT WEATHER DATA HERE]
                
                Rules:
                - Write in Polish only
                - No em dashes (avoid — character)
                - Do NOT mention the city name
                - Keep it to 3-4 sentences
                
                Make the activity suggestions feel genuinely earned by the specific conditions. Consider:
                - Exact temperature (is it 8°C cold or 22°C perfect? Say so with texture)
                - Wind speed (a gentle breeze vs. 40 km/h gusts are different stories)
                - Precipitation type and intensity (light drizzle vs. downpour vs. none at all)
                - Visibility and cloud cover
                - Time of day and season
                
                For activities, be SPECIFIC and CREATIVE based on actual conditions:
                - If it's cold + sunny → great for a brisk hike, terrible for a picnic
                - If it's windy → perfect for flying a kite, bad for cycling
                - If it's rainy + warm → skip the park, great day for a museum or café hopping
                - If it's hot + humid → avoid noon runs, ideal for an early morning swim
                - If it's overcast but dry → perfect for photography (soft light!), decent for a walk
                
                For each activity suggestion, briefly explain WHY the conditions make it good or bad
                — not just "great day for a run" but "great day for a run since the cool 12°C air
                and low humidity mean you won't overheat." The reason should feel natural and
                conversational, woven into the sentence, not tacked on as an afterthought.
                
                Vary your tone: sometimes enthusiastic, sometimes cautionary, sometimes wry.
                Do NOT default to "dobry dzień na rower" (good day for biking) unless conditions truly call for it.
                The sentence structure and word choice should feel fresh each time — avoid formulaic openings.
            `,
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
export function formatWeatherData(data: any): string {
    const days = data.daily.sunrise.map((_: string, i: number) => {
        const date = data.daily.sunrise[i]?.split("T")[0] ?? "";

        const hourlyEntries = data.hourly.time
            .map((time: string, idx: number) => ({ time, temp: data.hourly.temperature[idx] ?? 0 }))
            .filter(({ time }: { time: string }) => time.startsWith(date));

        const keyHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        const hourlyStr = keyHours
            .map((h: number) => {
                const entry = hourlyEntries.find(
                    ({ time }: { time: string }) => time === `${date}T${String(h).padStart(2, "0")}:00`
                );
                return entry ? `${h}:00=${entry.temp}°C` : null;
            })
            .filter((x: unknown): x is string => x !== null)
            .join(", ");

        return [
            `📅 ${date}`,
            `  🌡 Hourly: ${hourlyStr}`,
            `  🌧 Rain: ${data.daily.rain_sum[i] ?? "N/A"}mm`,
            `  ☀️ UV max: ${data.daily.uv_index_max[i] ?? "N/A"}`,
            `  🌅 Sunrise: ${data.daily.sunrise[i]?.split("T")[1] ?? "N/A"}`,
            `  🌇 Sunset: ${data.daily.sunset[i]?.split("T")[1] ?? "N/A"}`,
        ].join("\n");
    });

    return [
        `🌡 Current: ${data.current.temperature}°C, Wind: ${data.current.wind_speed} km/h`,
        ``,
        days.join("\n\n"),
        ``,
        `📝 Summary: ${data.summary}`,
    ].join("\n");
}
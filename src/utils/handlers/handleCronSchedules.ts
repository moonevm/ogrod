import type { Telegraf } from "telegraf";
import path from "path";

export async function handleCronSchedules(bot: Telegraf) {
    const glob = new Bun.Glob("**/*.ts");
    const dir = path.join(import.meta.dir, "../cron");

    for await (const file of glob.scan(dir)) {
        const mod = await import(`${dir}/${file}`);
        mod(bot)
    }
}

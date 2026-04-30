import type { Telegraf, Context } from "telegraf";
import path from "path";

interface ButtonModule {
    name: string | RegExp;
    description: string;
    handler: (ctx: Context) => Promise<void>;
}

export async function handleButtons(bot: Telegraf) {
    const glob = new Bun.Glob("**/*.ts");
    const dir = path.join(import.meta.dir, "../../buttons");
    const names: string[] = [];

    for await (const file of glob.scan(dir)) {
        const mod: ButtonModule = await import(`${dir}/${file}`);
        bot.action(mod.name, async (ctx) => {
            try {
                void mod.handler(ctx);
            } catch (e) {
                console.error(`Error in button [${mod.name}]:`, e);
            }
        });
        names.push(String(mod.name));
    }

    console.log(`Registered ${names.length} button(s):`, names.join(", "));
}

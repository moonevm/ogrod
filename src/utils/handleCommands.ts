import {type Context, Telegraf} from "telegraf";
import path from "path"

export interface Command {
    name: string
    description: string
    handler: (ctx: Context) => Promise<void>
}

export const commands = new Map<string, Command>()

export async function handleCommands(bot: Telegraf) {
    const dir = path.join(__dirname, "..", "commands")

    for await (const file of new Bun.Glob("**/*.ts").scan(dir)) {
        const module: Command = await import(path.join(dir, file))

        bot.command(module.name, (ctx) => { void module.handler(ctx) })
        commands.set(module.name, module)
    }

    await bot.telegram.setMyCommands([...commands.values()].map((e) => ({ command: e.name, description: e.description })))

    console.log(`Loaded ${commands.size} commands. (${[...commands.values()].map((e) => `/${e.name}`).join(", ")})`)
}
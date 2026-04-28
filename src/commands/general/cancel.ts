import {Context} from "telegraf";
import {deletePromise} from "../../utils/awaitMessage.ts";

export const name = "cancel"
export const description = "Cancel Current Action"

export async function handler(ctx: Context) {
    if (!await deletePromise(ctx.from!.id)) return await ctx.reply("❌ There was no action to cancel")

    await ctx.deleteMessage()
}
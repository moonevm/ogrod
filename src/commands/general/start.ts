import { Context } from "telegraf";
import { awaitMessage } from "../../utils/awaitMessage.ts";

export const name = "start"
export const description = "Initial Message"

export async function handler(ctx: Context) {
    const message = await ctx.reply("Message:");
    const edit = (text: string) =>
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text);

    try {
        const msg = await awaitMessage(ctx.from!.id);
        await edit(msg.interaction.text!);
    } catch {
        await edit("Request Cancelled");
    }
}

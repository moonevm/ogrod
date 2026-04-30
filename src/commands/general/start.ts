import { Context } from "telegraf";
import {prisma} from "../../utils/prisma.ts";
import generateId from "../../utils/generateId.ts";

export const name = "start"
export const description = "Initial Message"

export async function handler(ctx: Context) {
    await ctx.react("👀")

    if (!await prisma.user.findFirst({ where: { userId: ctx.from!.id } })) {
        await prisma.user.create({
            data: {
                id: generateId({ prefix: "user" }),
                userId: ctx.from!.id,
                latestMessageId: 0
            }
        })
    }
}

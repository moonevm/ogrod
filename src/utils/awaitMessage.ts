import type {Context} from "telegraf";

const Promises = new Map<number, {
    resolve: (value: { interaction: Context }) => void,
    reject: (reason: String) => void,
}>()

export async function awaitMessage(userId: number, timeout = 5_000): Promise<{ interaction: Context }> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Timeout")
            Promises.delete(userId)
        }, timeout);

        Promises.set(userId, { reject, resolve })
    })
}

export async function awaitMessageMiddleware(ctx: Context, next: () => Promise<void>) {
    const promise = Promises.get(ctx.from!.id)
    if (!promise) return await next()

    if (ctx.text?.startsWith("/cancel")) return await next()
    if (ctx.text?.startsWith("/")) return

    await ctx.deleteMessage()
    Promises.delete(ctx.from!.id)
    promise.resolve({ interaction: ctx })
}


// Returns true on success, returns false if there's no promise active
export async function deletePromise(userId: number) {
    const promise = Promises.get(userId)

    if (!promise) return false

    Promises.delete(userId)
    promise.reject("User Cancelled")
    return true
}
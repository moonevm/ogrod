import type {Context} from "telegraf";

const Promises = new Map<number, {
    resolve: (value: { interaction: Context }) => void,
    reject: (reason: string) => void,
    timeoutId: ReturnType<typeof setTimeout>,
}>()

export async function awaitMessage(userId: number, timeout = 60_000): Promise<{ interaction: Context }> {
    const existing = Promises.get(userId)
    if (existing) {
        clearTimeout(existing.timeoutId)
        Promises.delete(userId)
        existing.reject("Replaced")
    }

    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            Promises.delete(userId)
            reject("Timeout")
        }, timeout);

        Promises.set(userId, { reject, resolve, timeoutId })
    })
}

export async function awaitMessageMiddleware(ctx: Context, next: () => Promise<void>) {
    const promise = Promises.get(ctx.from!.id)
    if (!promise) return await next()

    if (ctx.text?.startsWith("/cancel")) return await next()
    if (ctx.text?.startsWith("/")) return

    await ctx.deleteMessage()
    clearTimeout(promise.timeoutId)
    Promises.delete(ctx.from!.id)
    promise.resolve({ interaction: ctx })
}


// Returns true on success, returns false if there's no promise active
export async function deletePromise(userId: number) {
    const promise = Promises.get(userId)

    if (!promise) return false

    clearTimeout(promise.timeoutId)
    Promises.delete(userId)
    promise.reject("User Cancelled")
    return true
}
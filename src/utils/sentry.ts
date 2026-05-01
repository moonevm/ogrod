import * as Sentry from "@sentry/bun";
import type { Context } from "telegraf";
import { prisma } from "./prisma.ts";

Sentry.init({
    dsn: process.env.SENTRY!,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME,
});

export async function captureExceptionWithMetadata(
    error: unknown,
    context: {
        location: string;
        telegrafContext?: Context;
        extra?: Record<string, unknown>;
    }
) {
    const { location, telegrafContext, extra } = context;

    Sentry.addBreadcrumb({
        category: "error",
        message: `Error in ${location}`,
        level: "error",
        data: extra,
    });

    if (telegrafContext) {
        const user = await prisma.user.findFirst({
            where: { userId: telegrafContext.from?.id },
        });

        Sentry.setUser({
            id: telegrafContext.from?.id?.toString(),
            username: telegrafContext.from?.username,
            first_name: telegrafContext.from?.first_name,
            last_name: telegrafContext.from?.last_name,
            language_code: telegrafContext.from?.language_code,
            is_premium: telegrafContext.from?.is_premium,
            db_id: user?.id,
            active: user?.active,
        });

        if (telegrafContext.chat) {
            Sentry.setContext("chat", {
                id: telegrafContext.chat.id,
                type: telegrafContext.chat.type,
                ...(telegrafContext.chat.type !== "private" && { title: (telegrafContext.chat as any).title }),
                ...(telegrafContext.chat.type === "supergroup" && { username: (telegrafContext.chat as any).username }),
            });
        }
    }

    Sentry.setContext("location", { file: location });

    if (extra) {
        Sentry.setExtras(extra);
    }

    return Sentry.captureException(error);
}
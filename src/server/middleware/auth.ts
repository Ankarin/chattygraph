import { os } from "@orpc/server";
import { auth } from "@clerk/nextjs/server";

export const authMiddleware = os.middleware(async ({ context, next }) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    return next({
        context: {
            userId,
        },
    });
});

export const authedProcedure = os.use(authMiddleware);

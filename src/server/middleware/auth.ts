import { os } from "@orpc/server";
import { auth } from "@clerk/nextjs/server";

export const authMiddleware = os.middleware(async ({ context, next }) => {
    const { userId, orgId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    if (!orgId) {
        throw new Error('No organization selected');
    }

    return next({
        context: {
            userId,
            organizationId: orgId,
        },
    });
});

export const authedProcedure = os.use(authMiddleware);


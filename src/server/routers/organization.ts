import { z } from "zod";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authedProcedure } from "../middleware/auth";

export const organizationRouter = {
    get: authedProcedure
        .input(z.object({}))
        .handler(async ({ context }) => {
            const org = await db.query.organizations.findFirst({
                where: eq(organizations.id, context.organizationId),
            });

            if (!org) {
                throw new Error('Organization not found');
            }

            return {
                id: org.id,
                data: org.data,
            };
        }),

    update: authedProcedure
        .input(z.object({
            data: z.any().optional().nullable(),
        }))
        .handler(async ({ input, context }) => {
            const org = await db.query.organizations.findFirst({
                where: eq(organizations.id, context.organizationId),
            });

            if (!org) {
                throw new Error('Organization not found');
            }

            const updateData: any = {};
            if (input.data !== undefined) updateData.data = input.data;

            const [updatedOrg] = await db
                .update(organizations)
                .set(updateData)
                .where(eq(organizations.id, context.organizationId))
                .returning();

            return {
                id: updatedOrg.id,
                data: updatedOrg.data,
            };
        }),
};








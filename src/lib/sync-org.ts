'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';

export async function syncOrganization() {
    try {
        const { userId, orgId } = await auth();

        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        if (!orgId) {
            return { success: false, error: 'No organization selected' };
        }

        let organizationName = 'Unnamed Organization';

        try {
            const client = await clerkClient();
            const org = await client.organizations.getOrganization({ organizationId: orgId });
            organizationName = org.name;
        } catch (error) {
            console.warn('Could not fetch organization name from Clerk:', error);
        }

        const existingOrg = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId),
        });

        const isNewOrg = !existingOrg;

        const [syncedOrg] = await db
            .insert(organizations)
            .values({
                id: orgId,
            })
            .onConflictDoNothing()
            .returning();

        if (isNewOrg) {
            const sql = neon(process.env.DATABASE_URL!);
            const sanitizedOrgId = orgId.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            await sql.query(`CREATE SCHEMA IF NOT EXISTS ${sanitizedOrgId}`);
            console.log(`✅ Created schema for organization: ${sanitizedOrgId}`);
        }

        return { success: true, organization: syncedOrg || existingOrg };
    } catch (error) {
        console.error('Error syncing organization:', error);
        return { success: false, error: String(error) };
    }
}


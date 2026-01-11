import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizations = pgTable("organizations", {
    id: text("id").primaryKey(),
    data: jsonb("data"),
});

export const chats = pgTable("chats", {
    id: text("id").primaryKey(),
    messages: jsonb("messages"),
    organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
    chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
    organization: one(organizations, {
        fields: [chats.organizationId],
        references: [organizations.id],
    }),
}));

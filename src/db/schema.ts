import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import type { AdapterAccountType } from "next-auth/adapters"

export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  discordId: text('discord_id').unique(),
  battleTag: text('battle_tag'),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  involvement: text('involvement').notNull(), // 'core', 'fill', 'heroic'
  availability: text('availability', { mode: 'json' }).notNull(), // JSON: { timezone: "EST", schedule: { ... } }
  specs: text('specs', { mode: 'json' }).notNull(), // JSON: [{ class: "Mage", specs: { fire: "like" } }]
  professions: text('professions', { mode: 'json' }), // JSON: [{ id: "alchemy", specId: "potions" }]
  comments: text('comments'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const raidCompositions = sqliteTable('raid_compositions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().default('Default Roster'),
  rosterData: text('roster_data', { mode: 'json' }).notNull(), // JSON: Player[]
  playerOverrides: text('player_overrides', { mode: 'json' }).$type<Record<string, any>>().default({}), // JSON: Record<string, Partial<Player>>
  roleMappings: text('role_mappings', { mode: 'json' }).$type<Record<string, string>>().default({}), // JSON: Record<string, roleId>
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

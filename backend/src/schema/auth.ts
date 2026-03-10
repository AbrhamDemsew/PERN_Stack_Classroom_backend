import { boolean, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const user = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: varchar("image", { length: 1024 }),
  role: varchar("role", { length: 50 }).default("student").notNull(),
  imageCldPubId: varchar("imageCldPubId", { length: 255 }),
  ...timestamps,
});

export const session = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    token: text("token").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    ipAddress: varchar("ipAddress", { length: 255 }),
    userAgent: varchar("userAgent", { length: 255 }),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_unique").on(table.token),
  }),
);

export const account = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    accountId: varchar("accountId", { length: 255 }).notNull(),
    providerId: varchar("providerId", { length: 255 }).notNull(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => ({
    providerAccountUnique: uniqueIndex("accounts_provider_account_unique").on(table.providerId, table.accountId),
  }),
);

export const verification = pgTable(
  "verifications",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => ({
    identifierValueUnique: uniqueIndex("verifications_identifier_value_unique").on(table.identifier, table.value),
  }),
);

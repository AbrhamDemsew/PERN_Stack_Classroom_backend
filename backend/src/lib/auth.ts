import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db"; // your drizzle instance
import * as schema from "../schema/schema"; // your drizzle schema

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    baseURL: process.env.BETTER_AUTH_URL || process.env.BACKEND_URL || 'http://localhost:8000',
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
        additionalFields: {
           role: {
              type: "string", required: true, defaultValue: 'student', input: true,
           },
           imageCldPubId: {
              type: "string", required: false, input: true,
           },
        }
    }
});
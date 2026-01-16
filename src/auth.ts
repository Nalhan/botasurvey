import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    providers: [
        Discord,
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        }
    }
})

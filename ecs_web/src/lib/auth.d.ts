import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: string
      avatar: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    avatar?: string | null
  }
}

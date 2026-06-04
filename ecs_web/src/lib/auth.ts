import NextAuth, { type NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { Role } from "@/types"
import { authService } from "@/services/auth.service"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
      clinicId?: string
      avatar?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
    clinicId?: string
    avatar?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    clinicId?: string
    avatar?: string
  }
}

const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const result = await authService.login({
            email: credentials.email as string,
            password: credentials.password as string,
          })

          if (result.success && result.data) {
            return {
              id: result.data.user.id,
              email: result.data.user.email,
              name: result.data.user.name,
              role: result.data.user.role,
              clinicId: result.data.user.clinicId,
              avatar: result.data.user.avatar,
            }
          }

          return null
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.clinicId = user.clinicId
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.clinicId = token.clinicId
        session.user.avatar = token.avatar
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export function getRoleFromToken(token: unknown): Role | null {
  if (token && typeof token === "object" && "role" in token) {
    return (token as { role: Role }).role
  }
  return null
}

export function hasPermission(role: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(role)
}

export const ROLE_PERMISSIONS = {
  [Role.SYSTEM_ADMIN]: ["*"],
  [Role.CLINIC_ADMIN]: [
    "clinics.read",
    "clinics.write",
    "staff.read",
    "staff.write",
    "patients.read",
    "patients.write",
    "appointments.read",
    "appointments.write",
    "medicines.read",
    "medicines.write",
    "services.read",
    "services.write",
    "rooms.read",
    "rooms.write",
    "feedback.read",
  ],
  [Role.DOCTOR]: [
    "patients.read",
    "patients.write",
    "appointments.read",
    "appointments.write",
    "records.read",
    "records.write",
    "queue.read",
    "queue.write",
  ],
  [Role.RECEPTIONIST]: [
    "patients.read",
    "appointments.read",
    "appointments.write",
    "queue.read",
    "queue.write",
  ],
} as const

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authService } from "@/services/auth.service"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
            emailAddress: credentials.email as string,
            password: credentials.password as string,
          })

          if (result.data?.token) {
            authService.setToken(result.data.token)
            
            const decodedToken = authService.decodeToken(result.data.token)
            if (decodedToken) {
              const role = decodedToken.role ||
                decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                ""

              return {
                id: decodedToken.sub,
                email: decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
                name: decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "",
                role: role,
              }
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})

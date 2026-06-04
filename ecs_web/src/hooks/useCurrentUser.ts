"use client"

import { useSession } from "next-auth/react"
import type { User, Role } from "@/types"

export function useCurrentUser(): User | null {
  const { data: session } = useSession()

  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.name || "",
      role: session.user.role as Role,
      clinicId: session.user.clinicId,
      avatar: session.user.avatar,
    }
  }

  return null
}

export function useHasRole(requiredRoles: Role | Role[]): boolean {
  const user = useCurrentUser()

  if (!user) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}

export function useIsAuthenticated(): boolean {
  const { data: session, status } = useSession()
  return status === "authenticated" && !!session?.user
}

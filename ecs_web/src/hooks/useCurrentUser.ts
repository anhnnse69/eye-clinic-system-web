"use client"

import { authService } from "@/services/auth.service"
import type { User, Role } from "@/types"
import { useEffect, useState } from "react"

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(authService.getUser())
  }, [])

  return user
}

export function useHasRole(requiredRoles: Role | Role[]): boolean {
  const user = useCurrentUser()

  if (!user) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}

export function useIsAuthenticated(): boolean {
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(authService.isAuthenticated())
  }, [])

  return isAuth
}

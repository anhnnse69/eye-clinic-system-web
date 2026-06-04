import { apiClient } from "@/lib/axios"
import type { ApiResponse, User } from "@/types"
import type { Role } from "@/types"

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

interface AuthState {
  token: string | null
  user: User | null
}

class AuthService {
  private readonly TOKEN_KEY = "accessToken"
  private readonly USER_KEY = "userData"

  getAuthState(): AuthState {
    if (typeof window === "undefined") {
      return { token: null, user: null }
    }
    return {
      token: localStorage.getItem(this.TOKEN_KEY),
      user: this.getUser(),
    }
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userData = localStorage.getItem(this.USER_KEY)
    if (!userData) return null
    try {
      return JSON.parse(userData) as User
    } catch {
      return null
    }
  }

  clearAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  hasRole(role: Role): boolean {
    const user = this.getUser()
    return user?.role === role
  }

  hasAnyRole(roles: Role[]): boolean {
    const user = this.getUser()
    return user ? roles.includes(user.role) : false
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", credentials)
      if (response.data.success && response.data.data) {
        this.setToken(response.data.data.token)
        this.setUser(response.data.data.user)
      }
      return response.data
    } catch (error) {
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout")
    } catch {
      // Ignore errors
    } finally {
      this.clearAuth()
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) return null

      const response = await apiClient.post<ApiResponse<{ token: string }>>("/auth/refresh", {
        refreshToken,
      })

      if (response.data.success && response.data.data) {
        this.setToken(response.data.data.token)
        return response.data.data.token
      }
      return null
    } catch {
      this.clearAuth()
      return null
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>("/auth/forgot-password", { email })
    return response.data
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>("/auth/reset-password", {
      token,
      password,
    })
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>("/auth/change-password", {
      currentPassword,
      newPassword,
    })
    return response.data
  }
}

export const authService = new AuthService()
export default authService

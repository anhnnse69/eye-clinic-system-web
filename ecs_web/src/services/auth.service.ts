import { apiClient, handleApiError } from "@/lib/axios"
import type {
  ApiResponse,
  LoginResponse,
  User,
  Role,
  ViewAccountInfoResponse,
  GetPersonalProfileResponse,
} from "@/types"

export interface LoginRequest {
  emailAddress: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface RegisterClinicApplicationRequest {
  clinicName: string
  clinicAddress: string
  contactName: string
  contactPhone: string
  contactEmail: string
  businessLicenseUrl?: string | null
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  resetToken: string
  otp: string
  newPassword: string
  confirmPassword: string
}

export interface AuthState {
  token: string | null
  user: User | null
}

interface TokenPayload {
  sub: string
  role?: string
  email: string
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string
  FullName?: string
  Phone?: string
  jti: string
  nbf: number
  exp: number
  iss: string
  aud: string
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

  decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
      return JSON.parse(jsonPayload) as TokenPayload
    } catch {
      return null
    }
  }

  getDashboardPathByRole(role: string): string {
    const roleMapping: Record<string, string> = {
      SYSTEM_ADMIN: "/system-admin/dashboard",
      CLINIC_ADMIN: "/clinic-admin/dashboard",
      DOCTOR: "/doctor/dashboard",
      RECEPTIONIST: "/receptionist/dashboard",
      PATIENT: "/patient/profiles",
    }
    return roleMapping[role] || "/"
  }

  getDefaultDashboard(): string {
    return "/system-admin/dashboard"
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", credentials)

      if (response.data.data?.token) {
        this.setToken(response.data.data.token)

        const decodedToken = this.decodeToken(response.data.data.token)
        if (decodedToken) {
          // .NET uses "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" for role
          const role = decodedToken.role ||
            decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            ""

          const user: User = {
            id: decodedToken.sub,
            email: decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
            name: decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "",
            role: role as Role,
            avatar: undefined,
            createdAt: undefined,
            updatedAt: undefined,
          }
          this.setUser(user)
        }
      }

      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async register(request: RegisterRequest): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.post<ApiResponse<boolean>>("/auth/register", request)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async registerClinicApplication(
    request: RegisterClinicApplicationRequest
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.post<ApiResponse<boolean>>(
        "/auth/register-clinic-application",
        request
      )
      return response.data
    } catch (error) {
      throw handleApiError(error)
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

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.post<ApiResponse<string>>("/auth/forgot-password", { email })
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<ApiResponse<null>>("/auth/reset-password", request)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  /**
   * Fetches the authenticated user's account information.
   * Uses the JWT from localStorage (attached automatically by apiClient).
   * Backed by GET /api/v1/auth/me.
   */
  async getAccountInfo(): Promise<ApiResponse<ViewAccountInfoResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<ViewAccountInfoResponse>>("/auth/me")
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }

  async getPersonalProfile(userId: string): Promise<ApiResponse<GetPersonalProfileResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<GetPersonalProfileResponse>>(`/auth/profile/${userId}`)
      return response.data
    } catch (error) {
      throw handleApiError(error)
    }
  }
}

export const authService = new AuthService()
export default authService

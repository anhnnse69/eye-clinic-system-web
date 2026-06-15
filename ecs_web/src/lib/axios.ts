import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios"

export interface ApiErrorResponse {
  codeMessage: string
  data?: unknown
  meta?: unknown
}

export class ApiError extends Error {
  public statusCode: number
  public codeMessage: string
  public data?: unknown

  constructor(message: string, statusCode: number, codeMessage: string, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
    this.codeMessage = codeMessage
    this.data = data
  }
}

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false,
  })

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      // We used to hard-redirect to /login on any 401 here, but that caused
      // account-info and other pages to bounce users out whenever an
      // authenticated call (e.g. GET /auth/me) returned 401 for transient
      // reasons (token near expiry, CORS preflight race, etc).
      //
      // Instead we just attach a flag and let the caller decide.
      // Hard logout is still performed by explicit logout actions
      // (DashboardHeader / AccountHeader) and by layouts that detect a
      // missing cookie.
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          ;(error as AxiosError & { __skipAuthRedirect?: boolean }).__skipAuthRedirect = true
        }
      }

      const codeMessage =
        error.response?.data?.codeMessage ||
        (error.response?.status === 400 ? "APP_MESSAGE_4000" : "APP_MESSAGE_5000")

      return Promise.reject(
        new ApiError(
          error.message || "An error occurred",
          error.response?.status || 500,
          codeMessage,
          error.response?.data?.data
        )
      )
    }
  )

  return client
}

export const apiClient = createApiClient()

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.codeMessage
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    return axiosError.response?.data?.codeMessage || "APP_MESSAGE_5000"
  }
  return "APP_MESSAGE_5000"
}

export default apiClient
export { axios }

import type { RequestConfig, SDKConfig } from "../types/api"

export class HTTPClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private retries: number

  constructor(config: SDKConfig = {}) {
    this.baseURL = config.baseURL || "https://v2.api.noroff.dev"
    this.timeout = config.timeout || 30000
    this.retries = config.retries || 3

    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers
    }

    if (config.apiKey) {
      this.defaultHeaders["X-Noroff-API-Key"] = config.apiKey
    }

    if (config.accessToken) {
      this.defaultHeaders.Authorization = `Bearer ${config.accessToken}`
    }
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(endpoint, this.baseURL)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      }
    }

    return url.toString()
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const { method, url, data, params, headers } = config
    const requestURL = this.buildURL(url, params)

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(this.timeout)
    }

    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = JSON.stringify(data)
    }

    let lastError: Error

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(requestURL, requestOptions)

        if (!response.ok) {
          const errorText = await response.text()
          let errorData: unknown

          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }

          throw new APIError(
            (errorData as { message?: string }).message ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          )
        }

        const responseText = await response.text()

        if (!responseText.trim()) {
          return {} as T
        }

        try {
          return JSON.parse(responseText) as T
        } catch (error) {
          throw new APIError(
            "Invalid JSON response from server",
            response.status,
            { originalResponse: responseText }
          )
        }
      } catch (error) {
        lastError = error as Error

        if (attempt < this.retries && this.shouldRetry(error as Error)) {
          await this.sleep(2 ** attempt * 1000) // Exponential backoff
          continue
        }

        throw error
      }
    }

    throw lastError!
  }

  private shouldRetry(error: Error): boolean {
    if (error instanceof APIError) {
      // Retry on 5xx errors and specific 4xx errors
      return error.status >= 500 || error.status === 429 || error.status === 408
    }

    // Retry on network errors
    return error.name === "TypeError" || error.name === "AbortError"
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>({ method: "GET", url, params, headers })
  }

  async post<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>({ method: "POST", url, data, headers })
  }

  async put<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>({ method: "PUT", url, data, headers })
  }

  async patch<T>(
    url: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>({ method: "PATCH", url, data, headers })
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: "DELETE", url, headers })
  }

  setApiKey(apiKey: string): void {
    this.defaultHeaders["X-Noroff-API-Key"] = apiKey
  }

  setAccessToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  removeApiKey(): void {
    // biome-ignore lint/performance/noDelete: Allow delete
    delete this.defaultHeaders["X-Noroff-API-Key"]
  }

  removeAccessToken(): void {
    // biome-ignore lint/performance/noDelete: Allow delete
    delete this.defaultHeaders.Authorization
  }
}

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = "APIError"
  }
}

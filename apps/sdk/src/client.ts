import { BooksModule } from "./modules/books/books"
import type { SDKConfig } from "./types/api"
import { HTTPClient } from "./utils/http-client"

/**
 * Main Noroff API v2 SDK Client
 *
 * @example
 * ```typescript
 * const client = new NoroffSDK({
 *   apiKey: 'your-api-key'
 * })
 *
 * // Get all books
 * const books = await client.books.getAll({ limit: 10 })
 *
 * // Get a specific book
 * const book = await client.books.getById(1)
 * ```
 */
export class NoroffSDK {
  private httpClient: HTTPClient

  public readonly books: BooksModule

  constructor(config: SDKConfig = {}) {
    this.httpClient = new HTTPClient(config)

    // Initialize modules
    this.books = new BooksModule(this.httpClient)
  }

  /**
   * Update the API key for authentication
   */
  setApiKey(apiKey: string): void {
    this.httpClient.setApiKey(apiKey)
  }

  /**
   * Update the access token for authentication
   */
  setAccessToken(token: string): void {
    this.httpClient.setAccessToken(token)
  }

  /**
   * Remove the API key
   */
  removeApiKey(): void {
    this.httpClient.removeApiKey()
  }

  /**
   * Remove the access token
   */
  removeAccessToken(): void {
    this.httpClient.removeAccessToken()
  }

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getHttpClient(): HTTPClient {
    return this.httpClient
  }
}

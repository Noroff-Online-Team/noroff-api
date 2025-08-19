import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Book } from "../../types/books"
import type { HTTPClient } from "../../utils/http-client"
import type { BooksArrayResponse, SingleBookResponse } from "./books"
import { BooksModule } from "./books"

describe("BooksModule", () => {
  let booksModule: BooksModule
  let mockHttpClient: HTTPClient

  const mockBook: Book = {
    id: 1,
    title: "Test Book",
    author: "Test Author",
    genre: "Fiction",
    description: "A test book",
    isbn: "978-1234567890",
    image: {
      url: "https://example.com/book.jpg",
      alt: "Test book cover"
    },
    published: "2023-01-01",
    publisher: "Test Publisher"
  }

  const mockApiResponse: BooksArrayResponse = {
    data: [mockBook],
    meta: {
      currentPage: 1,
      totalCount: 1,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      previousPage: null,
      nextPage: null
    }
  }

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      setApiKey: vi.fn(),
      setAccessToken: vi.fn(),
      removeApiKey: vi.fn(),
      removeAccessToken: vi.fn()
    } as unknown as HTTPClient

    booksModule = new BooksModule(mockHttpClient)
  })

  describe("getAll", () => {
    it("should fetch all books with default parameters", async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse)

      const result = await booksModule.getAll()

      expect(mockHttpClient.get).toHaveBeenCalledWith("/books", undefined)
      expect(result).toEqual(mockApiResponse)
    })

    it("should fetch books with query parameters", async () => {
      const params = {
        limit: 10,
        page: 1,
        sort: "title" as const,
        sortOrder: "asc" as const
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(mockApiResponse)

      await booksModule.getAll(params)

      expect(mockHttpClient.get).toHaveBeenCalledWith("/books", params)
    })
  })

  describe("getRandom", () => {
    it("should fetch a random book", async () => {
      const singleBookResponse: SingleBookResponse = {
        data: mockBook,
        meta: {}
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(singleBookResponse)

      const result = await booksModule.getRandom()

      expect(mockHttpClient.get).toHaveBeenCalledWith("/books/random")
      expect(result).toEqual(singleBookResponse)
    })
  })

  describe("getById", () => {
    it("should fetch a book by ID", async () => {
      const singleBookResponse: SingleBookResponse = {
        data: mockBook,
        meta: {}
      }
      vi.mocked(mockHttpClient.get).mockResolvedValue(singleBookResponse)

      const result = await booksModule.getById(1)

      expect(mockHttpClient.get).toHaveBeenCalledWith("/books/1")
      expect(result).toEqual(singleBookResponse)
    })

    it("should throw error for invalid ID", async () => {
      await expect(booksModule.getById(-1)).rejects.toThrow(
        "ID must be a positive integer"
      )
      await expect(booksModule.getById(0)).rejects.toThrow(
        "ID must be a positive integer"
      )
      await expect(booksModule.getById(1.5)).rejects.toThrow(
        "ID must be an integer"
      )
    })
  })
})

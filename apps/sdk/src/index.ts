export { NoroffSDK } from "./client"

export { HTTPClient, APIError } from "./utils/http-client"

export type {
  SDKConfig,
  APIResponse,
  Meta,
  SortAndPagination,
  HTTPMethod,
  RequestConfig
} from "./types/api"
export { sortOrderSchema, createSortAndPaginationSchema } from "./types/api"
export type {
  Book,
  BookParams,
  Media,
  BooksQueryParams,
  SortableBookField,
  SortOrder
} from "./types/books"

export { BooksModule } from "./modules/books/books"

export type {
  BooksArrayResponse,
  SingleBookResponse
} from "./modules/books/books"
export {
  booksArrayResponseSchema,
  singleBookResponseSchema
} from "./modules/books/books"

export { bookSchema, bookParamsSchema, mediaSchema } from "./types/books"
export {
  metaSchema,
  apiResponseSchema,
  createSingleItemResponseSchema,
  createArrayResponseSchema,
  sortAndPaginationSchema
} from "./types/api"

export { NoroffSDK as default } from "./client"

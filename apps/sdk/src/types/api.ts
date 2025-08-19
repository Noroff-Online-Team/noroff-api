import { z } from "zod"

// Core API response structure from api-utils
export const metaSchema = z
  .object({
    isFirstPage: z.boolean().optional(),
    isLastPage: z.boolean().optional(),
    currentPage: z.number().int().positive().optional(),
    previousPage: z.number().int().positive().optional().nullable(),
    nextPage: z.number().int().positive().optional().nullable(),
    pageCount: z.number().int().nonnegative().optional(),
    totalCount: z.number().int().nonnegative().optional()
  })
  .default({})

export const createSingleItemResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: dataSchema,
    meta: metaSchema
  })

export const createArrayResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: z.array(dataSchema),
    meta: metaSchema
  })

// Shared sort order enum
export const sortOrderSchema = z.enum(["asc", "desc"] as const)

// Reusable builder for module query schemas
export const createSortAndPaginationSchema = <U extends readonly string[]>({
  sortableFields
}: {
  sortableFields: U
}) =>
  z.object({
    sort: z
      .enum(sortableFields as unknown as [U[number], ...U[number][]])
      .optional(),
    sortOrder: sortOrderSchema.optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    page: z.coerce.number().int().positive().optional()
  })

// Generic response schema
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    data: z.union([dataSchema, z.array(dataSchema)]),
    meta: metaSchema
  })

// Pagination and sorting parameters
export const sortAndPaginationSchema = z.object({
  sort: z.string().optional(),
  sortOrder: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional()
})

// Reusable builder for path ID validation (int | uuid | string)
export const createIdParamSchema = (options: {
  kind: "int" | "uuid" | "string"
  fieldName?: string
}) => {
  const field = options.fieldName ?? "id"
  if (options.kind === "int") {
    return z.object({
      [field]: z.coerce
        .number()
        .int("ID must be an integer")
        .positive("ID must be a positive integer")
    })
  }
  if (options.kind === "uuid") {
    return z.object({ [field]: z.string().uuid("ID must be a valid UUID") })
  }
  return z.object({
    [field]: z
      .string({ required_error: "ID is required" })
      .min(1, "ID must be a non-empty string")
  })
}

// SDK Configuration
export interface SDKConfig {
  baseURL?: string
  apiKey?: string
  accessToken?: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

// Response types
export type APIResponse<T> = z.infer<ReturnType<typeof apiResponseSchema<T>>>
export type Meta = z.infer<typeof metaSchema>
export type SortAndPagination = z.infer<typeof sortAndPaginationSchema>

// HTTP method types
export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

// Request configuration
export interface RequestConfig {
  method: HTTPMethod
  url: string
  data?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

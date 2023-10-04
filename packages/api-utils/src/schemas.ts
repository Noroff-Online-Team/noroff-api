import { z } from "zod"

const metaSchema = z
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

/**
 * Creates a response schema for a given data schema.
 * @param dataSchema The data schema to use for the response.
 * @param emptyMeta Whether or not to include an empty meta object in the response. Defaults to false.
 * @returns A response schema for a given data schema.
 */
export function createResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    data: z.union([dataSchema, z.array(dataSchema), z.object({})]),
    meta: metaSchema
  })
}

/**
 * Sort and pagination schema.
 */
export const sortAndPaginationSchema = z.object({
  sort: z
    .string({
      invalid_type_error: "Sort must be a string"
    })
    .optional(),
  sortOrder: z
    .string({
      invalid_type_error: "Sort order must be a string"
    })
    .optional(),
  limit: z.coerce
    .number({
      invalid_type_error: "Limit must be a number"
    })
    .int("Limit must be an integer")
    .positive("Limit must be a positive integer")
    .max(100, "Limit cannot be greater than 100")
    .optional(),
  page: z.coerce
    .number({
      invalid_type_error: "Page must be a number"
    })
    .int("Page must be an integer")
    .positive("Page must be a positive integer")
    .optional()
})

import { z } from "zod"

/*
  Defaults the meta property to empty object.
  Pagination is not available nor make sense on PUT, POST, DELETE requests, so the returned meta object will be empty.
*/
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

export function createResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    data: z.array(dataSchema).or(dataSchema).or(z.object({})),
    meta: metaSchema
  })
}

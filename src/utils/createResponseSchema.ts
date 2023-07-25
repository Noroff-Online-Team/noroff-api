import { z } from "zod"

const metaSchema = z.object({
  isFirstPage: z.boolean(),
  isLastPage: z.boolean(),
  currentPage: z.number().int().positive(),
  previousPage: z.number().int().positive().optional().nullable(),
  nextPage: z.number().int().positive().optional().nullable(),
  pageCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative()
})

export function createResponseSchema<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    data: z.array(dataSchema).or(dataSchema).or(z.object({})),
    meta: metaSchema
  })
}

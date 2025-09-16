import { type ZodSchema, z } from "zod"

export const metaSchema = z.object({
  isFirstPage: z.boolean(),
  isLastPage: z.boolean(),
  currentPage: z.number(),
  previousPage: z.number().nullable(),
  nextPage: z.number().nullable(),
  pageCount: z.number(),
  totalCount: z.number()
})

export type Meta = z.infer<typeof metaSchema>

export const successSchema = <T extends ZodSchema>(schema: T) =>
  z.object({
    data: schema,
    meta: metaSchema.optional()
  })

export const jsonResponse = <T extends ZodSchema>(
  schema: T,
  description: string
) => {
  return {
    content: {
      "application/json": {
        schema
      }
    },
    description
  }
}

export const successResponse = <T extends ZodSchema>(
  schema: T,
  description: string
) => jsonResponse(successSchema(schema), description)

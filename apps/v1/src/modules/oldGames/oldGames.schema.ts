import { z } from "zod"

export const oldGameResponseSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  released: z.string(),
  image: z.string(),
  genre: z.string().array()
})

export const oldGameParamsSchema = z.object({
  id: z.preprocess(
    val => Number.parseInt(val as string, 10),
    z
      .number({
        invalid_type_error: "ID parameter must be a number"
      })
      .int()
  )
})

export type OldGameSchema = z.infer<typeof oldGameResponseSchema>

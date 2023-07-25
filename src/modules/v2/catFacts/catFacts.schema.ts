import { z } from "zod"

export const catFactSchema = z.object({
  id: z.number().int(),
  text: z.string()
})

export const catFactParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type CatFactSchema = z.infer<typeof catFactSchema>

import { z } from "zod"

export const catFactResponseSchema = z.object({
  id: z.number().int(),
  text: z.string()
})

export const catFactParamsSchema = z.object({
  id: z.preprocess(val => parseInt(val as string, 10), z.number({
    invalid_type_error: "ID parameter must be a number"
  }).int())
})

export type CatFactSchema = z.infer<typeof catFactResponseSchema>

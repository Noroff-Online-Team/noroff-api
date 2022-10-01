import { z } from "zod"

export const catFactResponseSchema = z.object({
  id: z.number().int(),
  text: z.string()
})

export const catFactParamsSchema = z.object({
  id: z.number().int()
})

export type CatFactSchema = z.infer<typeof catFactResponseSchema>

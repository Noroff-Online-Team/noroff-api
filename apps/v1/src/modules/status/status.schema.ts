import { z } from "zod"

export const statusResponseSchema = z.object({
  status: z.string()
})

export type StatusSchema = z.infer<typeof statusResponseSchema>

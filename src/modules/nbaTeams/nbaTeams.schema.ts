import { z } from "zod"

export const nbaTeamResponseSchema = z.object({
  id: z.number().int(),
  city: z.string(),
  conference: z.string(),
  division: z.string(),
  full_name: z.string(),
  name: z.string()
})

export const nbaTeamParamsSchema = z.object({
  id: z.number().int()
})

export type NbaTeamSchema = z.infer<typeof nbaTeamResponseSchema>

import { z } from "zod"

export const nbaTeamSchema = z.object({
  id: z.number().int(),
  abbreviation: z.string(),
  city: z.string(),
  conference: z.string(),
  division: z.string(),
  full_name: z.string(),
  name: z.string()
})

export const nbaTeamParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type NbaTeamSchema = z.infer<typeof nbaTeamSchema>

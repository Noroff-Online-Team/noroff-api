import { z } from "zod"

export const nbaTeamResponseSchema = z.object({
  id: z.number().int(),
  abbreviation: z.string(),
  city: z.string(),
  conference: z.string(),
  division: z.string(),
  full_name: z.string(),
  name: z.string()
})

export const nbaTeamParamsSchema = z.object({
  id: z.preprocess(
    val => parseInt(val as string, 10),
    z
      .number({
        invalid_type_error: "ID parameter must be a number"
      })
      .int()
  )
})

export type NbaTeamSchema = z.infer<typeof nbaTeamResponseSchema>

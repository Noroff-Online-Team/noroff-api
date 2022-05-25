import { z } from "zod"
import { buildJsonSchemas } from "fastify-zod"

const nbaTeamSchema = z.object({
  id: z.number().int(),
  city: z.string(),
  conference: z.string(),
  division: z.string(),
  full_name: z.string(),
  name: z.string()
})

export type NbaTeamSchema = z.infer<typeof nbaTeamSchema>

export const { schemas: nbaTeamSchemas, $ref } = buildJsonSchemas(
  { nbaTeamSchema },
  { $id: "NbaTeams" }
)

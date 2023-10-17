import { z } from "zod"

export const jokeSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  setup: z.string(),
  punchline: z.string()
})

export const jokeParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type JokeSchema = z.infer<typeof jokeSchema>

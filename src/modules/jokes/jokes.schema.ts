import { z } from "zod"

export const jokeResponseSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  setup: z.string(),
  punchline: z.string()
})

export const jokeParamsSchema = z.object({
  id: z.preprocess(val => parseInt(val as string, 10), z.number().int())
})

export type JokeSchema = z.infer<typeof jokeResponseSchema>

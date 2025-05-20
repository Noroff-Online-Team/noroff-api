import { z } from "zod"

import { BookWithRelationsSchema } from "@/prisma/generated/zod"

export const bookSchema = BookWithRelationsSchema

export const bookParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type BookSchema = z.infer<typeof bookSchema>

import { z } from "zod"

export const sortAndPaginationSchema = z.object({
  sort: z
    .string({
      invalid_type_error: "Sort must be a string"
    })
    .optional(),
  sortOrder: z
    .string({
      invalid_type_error: "Sort order must be a string"
    })
    .optional(),
  limit: z.coerce
    .number({
      invalid_type_error: "Limit must be a number"
    })
    .int("Limit must be an integer")
    .positive("Limit must be a positive integer")
    .max(100, "Limit cannot be greater than 100")
    .optional(),
  page: z.coerce
    .number({
      invalid_type_error: "Page must be a number"
    })
    .int("Page must be an integer")
    .positive("Page must be a positive integer")
    .optional()
})

import { jsonResponse } from "@/helpers/response-schemas"
import { z } from "@hono/zod-openapi"

// @ts-expect-error
type ZodSchema = z.ZodUnion | z.AnyZodObject | z.ZodArray<z.AnyZodObject>

export const createErrorSchema = <T extends ZodSchema>(schema: T) => {
  const { error } = schema.safeParse(
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {}
  )
  return z.object({
    errors: z
      .array(
        z.object({
          message: z.string(),
          code: z.string().optional(),
          path: z.array(z.union([z.string(), z.number()])).optional()
        })
      )
      .openapi({
        example: error
      }),
    status: z.string().openapi({
      example: "Bad Request"
    }),
    statusCode: z.number().openapi({
      example: 400
    })
  })
}

export const errorResponse = <T extends ZodSchema>(schema: T) => {
  return jsonResponse(createErrorSchema(schema), "Error response")
}

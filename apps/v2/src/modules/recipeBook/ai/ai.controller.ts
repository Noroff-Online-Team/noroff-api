import type { FastifyRequest } from "fastify"

import {
  type GenerateRequest,
  type ScaleRequest,
  type SubstitutionsRequest,
  generateRequestSchema,
  scaleRequestSchema,
  substitutionsRequestSchema
} from "./ai.schema"
import { generateRecipe, getSubstitutions, scaleRecipe } from "./ai.service"

export async function getSubstitutionsHandler(
  request: FastifyRequest<{
    Body: SubstitutionsRequest
  }>
) {
  const data = await substitutionsRequestSchema.parseAsync(request.body)

  return getSubstitutions(data)
}

export async function scaleRecipeHandler(
  request: FastifyRequest<{
    Body: ScaleRequest
  }>
) {
  const data = await scaleRequestSchema.parseAsync(request.body)

  return scaleRecipe(data)
}

export async function generateRecipeHandler(
  request: FastifyRequest<{
    Body: GenerateRequest
  }>
) {
  const data = await generateRequestSchema.parseAsync(request.body)

  return generateRecipe(data)
}

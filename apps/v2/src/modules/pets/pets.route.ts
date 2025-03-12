import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  createPetHandler,
  deletePetHandler,
  getPetHandler,
  getPetsHandler,
  updatePetHandler
} from "./pets.controller"
import {
  createPetSchema,
  displayPetSchema,
  petIdSchema,
  petsQuerySchema,
  updatePetSchema
} from "./pets.schema"

async function petsRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        tags: ["pets"],
        querystring: petsQuerySchema,
        response: {
          200: createResponseSchema(displayPetSchema.array())
        }
      }
    },
    getPetsHandler
  )

  server.get(
    "/:id",
    {
      schema: {
        tags: ["pets"],
        params: petIdSchema,
        response: {
          200: createResponseSchema(displayPetSchema)
        }
      }
    },
    getPetHandler
  )

  server.post(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["pets"],
        security: [{ bearerAuth: [], apiKey: [] }],
        body: createPetSchema,
        response: {
          201: createResponseSchema(displayPetSchema)
        }
      }
    },
    createPetHandler
  )

  server.put(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["pets"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: petIdSchema,
        body: updatePetSchema,
        response: {
          200: createResponseSchema(displayPetSchema)
        }
      }
    },
    updatePetHandler
  )

  server.delete(
    "/:id",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["pets"],
        security: [{ bearerAuth: [], apiKey: [] }],
        params: petIdSchema
      }
    },
    deletePetHandler
  )
}

export default petsRoutes

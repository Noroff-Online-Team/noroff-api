import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  profileMediaSchema,
  profileNameSchema,
  queryFlagsSchema,
  profileCreditsSchema
} from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileMediaHandler,
  getProfileListingsHandler,
  getProfileCreditsHandler
} from "./profiles.controller"
import { listingQuerySchema, listingResponseSchema } from "../listings/listings.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: displayProfileSchema.array()
        }
      }
    },
    getProfilesHandler
  )

  server.get(
    "/:name",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: profileNameSchema,
        response: {
          200: displayProfileSchema
        }
      }
    },
    getProfileHandler
  )

  server.put(
    "/:name/media",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: profileMediaSchema,
        response: {
          200: displayProfileSchema.omit({ listings: true })
        }
      }
    },
    updateProfileMediaHandler
  )

  server.get(
    "/:name/listings",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: listingQuerySchema,
        params: profileNameSchema,
        response: {
          200: listingResponseSchema.array()
        }
      }
    },
    getProfileListingsHandler
  )

  server.get(
    "/:name/credits",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        response: {
          200: profileCreditsSchema
        }
      }
    },
    getProfileCreditsHandler
  )
}

export default profilesRoutes

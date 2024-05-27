import type { FastifyInstance } from "fastify"

import {
  listingQuerySchema,
  listingResponseSchema,
  profileBidsResponseSchema
} from "../listings/listings.schema"
import {
  getProfileBidsHandler,
  getProfileCreditsHandler,
  getProfileHandler,
  getProfileListingsHandler,
  getProfilesHandler,
  updateProfileMediaHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
  profileCreditsSchema,
  profileMediaSchema,
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema
} from "./profiles.schema"

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
    "/:name/bids",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        params: profileNameSchema,
        response: {
          200: profileBidsResponseSchema.array()
        }
      }
    },
    getProfileBidsHandler
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

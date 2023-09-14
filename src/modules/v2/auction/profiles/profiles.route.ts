import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  updateProfileSchema,
  profileNameSchema,
  queryFlagsSchema,
  profileCreditsSchema,
  searchQuerySchema
} from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileHandler,
  getProfileListingsHandler,
  getProfileCreditsHandler,
  getProfileBidsHandler,
  searchProfilesHandler
} from "./profiles.controller"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { listingQuerySchema, listingResponseSchema, profileBidsResponseSchema } from "../listings/listings.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: createResponseSchema(displayProfileSchema.array())
        }
      }
    },
    getProfilesHandler
  )

  server.get(
    "/:name",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: queryFlagsSchema,
        params: profileNameSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    getProfileHandler
  )

  server.get(
    "/search",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-listings"],
        querystring: searchQuerySchema,
        response: {
          200: createResponseSchema(displayProfileSchema.array())
        }
      }
    },
    searchProfilesHandler
  )

  server.put(
    "/:name",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: updateProfileSchema,
        response: {
          200: createResponseSchema(displayProfileSchema.omit({ listings: true }))
        }
      }
    },
    updateProfileHandler
  )

  server.get(
    "/:name/listings",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: listingQuerySchema,
        params: profileNameSchema,
        response: {
          200: createResponseSchema(listingResponseSchema.array())
        }
      }
    },
    getProfileListingsHandler
  )

  server.get(
    "/:name/bids",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        params: profileNameSchema,
        response: {
          200: createResponseSchema(profileBidsResponseSchema.array())
        }
      }
    },
    getProfileBidsHandler
  )

  server.get(
    "/:name/credits",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        response: {
          200: createResponseSchema(profileCreditsSchema)
        }
      }
    },
    getProfileCreditsHandler
  )
}

export default profilesRoutes

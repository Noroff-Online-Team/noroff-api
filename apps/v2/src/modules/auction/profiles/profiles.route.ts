import { createResponseSchema } from "@noroff/api-utils"
import type { FastifyInstance } from "fastify"

import {
  listingQuerySchema,
  listingResponseSchema,
  listingWinsQuerySchema,
  profileBidsResponseSchema
} from "../listings/listings.schema"
import {
  getProfileBidsHandler,
  getProfileCreditsHandler,
  getProfileHandler,
  getProfileListingsHandler,
  getProfileWinsHandler,
  getProfilesHandler,
  searchProfilesHandler,
  updateProfileHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
  profileCreditsSchema,
  profileNameSchema,
  profilesQuerySchema,
  queryFlagsSchema,
  searchQuerySchema,
  updateProfileSchema
} from "./profiles.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [], apiKey: [] }],
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
        security: [{ bearerAuth: [], apiKey: [] }],
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
        tags: ["auction-profiles"],
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
        security: [{ bearerAuth: [], apiKey: [] }],
        params: profileNameSchema,
        body: updateProfileSchema,
        response: {
          200: createResponseSchema(
            displayProfileSchema.omit({ listings: true })
          )
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
        security: [{ bearerAuth: [], apiKey: [] }],
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
        security: [{ bearerAuth: [], apiKey: [] }],
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
    "/:name/wins",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [], apiKey: [] }],
        querystring: listingWinsQuerySchema,
        params: profileNameSchema,
        response: {
          200: createResponseSchema(listingResponseSchema.array())
        }
      }
    },
    getProfileWinsHandler
  )

  server.get(
    "/:name/credits",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["auction-profiles"],
        security: [{ bearerAuth: [], apiKey: [] }],
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

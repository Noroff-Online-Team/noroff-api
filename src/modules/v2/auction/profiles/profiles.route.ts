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
  getProfileCreditsHandler,
  getProfileBidsHandler
} from "./profiles.controller"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { listingQuerySchema, listingResponseSchema, profileBidsResponseSchema } from "../listings/listings.schema"

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
          200: createResponseSchema(displayProfileSchema.array())
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
          200: createResponseSchema(displayProfileSchema)
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
          200: createResponseSchema(displayProfileSchema.omit({ listings: true }))
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
          200: createResponseSchema(listingResponseSchema.array())
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
          200: createResponseSchema(profileBidsResponseSchema.array())
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
          200: createResponseSchema(profileCreditsSchema)
        }
      }
    },
    getProfileCreditsHandler
  )
}

export default profilesRoutes

import { FastifyInstance } from "fastify"
import { createResponseSchema } from "@noroff/api-utils"

import { displayPostSchema, postsQuerySchema } from "../posts/posts.schema"
import {
  followProfileHandler,
  getProfileHandler,
  getProfilePostsHandler,
  getProfilesHandler,
  searchProfilesHandler,
  unfollowProfileHandler,
  updateProfileHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
  followUnfollowProfileSchema,
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
        tags: ["social-profiles"],
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
        tags: ["social-profiles"],
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
        tags: ["social-profiles"],
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
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: updateProfileSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    updateProfileHandler
  )

  server.put(
    "/:name/follow",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        response: {
          200: createResponseSchema(followUnfollowProfileSchema)
        }
      }
    },
    followProfileHandler
  )

  server.put(
    "/:name/unfollow",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        response: {
          200: createResponseSchema(followUnfollowProfileSchema)
        }
      }
    },
    unfollowProfileHandler
  )

  server.get(
    "/:name/posts",
    {
      onRequest: [server.authenticate, server.apiKey],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        querystring: postsQuerySchema,
        response: {
          200: createResponseSchema(displayPostSchema.array())
        }
      }
    },
    getProfilePostsHandler
  )
}

export default profilesRoutes

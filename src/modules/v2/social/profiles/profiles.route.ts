import { FastifyInstance } from "fastify"

import {
  displayProfileSchema,
  profilesQuerySchema,
  profileMediaSchema,
  profileNameSchema,
  queryFlagsSchema
} from "./profiles.schema"
import {
  getProfilesHandler,
  getProfileHandler,
  updateProfileMediaHandler,
  followProfileHandler,
  unfollowProfileHandler,
  getProfilePostsHandler
} from "./profiles.controller"
import { createResponseSchema } from "@/utils/createResponseSchema"
import { displayPostSchema, postsQuerySchema } from "../posts/posts.schema"

async function profilesRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
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
      preHandler: [server.authenticate],
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

  server.put(
    "/:name/media",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema,
        body: profileMediaSchema,
        response: {
          200: createResponseSchema(displayProfileSchema)
        }
      }
    },
    updateProfileMediaHandler
  )

  server.put(
    "/:name/follow",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema
      }
    },
    followProfileHandler
  )

  server.put(
    "/:name/unfollow",
    {
      preHandler: [server.authenticate],
      schema: {
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        params: profileNameSchema
      }
    },
    unfollowProfileHandler
  )

  server.get(
    "/:name/posts",
    {
      preHandler: [server.authenticate],
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

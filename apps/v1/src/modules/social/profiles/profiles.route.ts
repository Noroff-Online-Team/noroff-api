import { FastifyInstance } from "fastify"

import { displayPostSchema, postsQuerySchema } from "../posts/posts.schema"
import {
  followProfileHandler,
  getProfileHandler,
  getProfilePostsHandler,
  getProfilesHandler,
  unfollowProfileHandler,
  updateProfileMediaHandler
} from "./profiles.controller"
import {
  displayProfileSchema,
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
        tags: ["social-profiles"],
        security: [{ bearerAuth: [] }],
        querystring: profilesQuerySchema,
        response: {
          200: displayProfileSchema.array()
        }
      }
    },
    getProfilesHandler
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
          200: displayProfileSchema
        }
      }
    },
    updateProfileMediaHandler
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
          200: displayProfileSchema
        }
      }
    },
    getProfileHandler
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
          200: displayPostSchema.array()
        }
      }
    },
    getProfilePostsHandler
  )
}

export default profilesRoutes

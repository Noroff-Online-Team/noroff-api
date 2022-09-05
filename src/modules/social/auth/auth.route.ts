import { FastifyInstance } from "fastify";
import {
  loginHandler,
  registerProfileHandler,
} from "./auth.controller";
import { $ref } from "./auth.schema";
import { $ref as $profile } from "../profiles/profiles.schema";

async function socialAuthRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        tags: ["social-auth"],
        body: $profile("createProfileSchema"),
        response: {
          201: $profile("createProfileResponseSchema"),
        },
      },
    },
    registerProfileHandler
  );

  server.post(
    "/login",
    {
      schema: {
        tags: ["social-auth"],
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginHandler
  );
}

export default socialAuthRoutes;
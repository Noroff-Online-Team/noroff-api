import { FastifyInstance } from "fastify";
import {
  loginHandler,
  registerProfileHandler,
} from "./auth.controller";
import { $ref } from "./auth.schema";

async function socialAuthRoutes(server: FastifyInstance) {
  server.post(
    "/register",
    {
      schema: {
        body: $ref("createProfileSchema"),
        response: {
          201: $ref("createProfileResponseSchema"),
        },
      },
    },
    registerProfileHandler
  );

  server.post(
    "/login",
    {
      schema: {
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
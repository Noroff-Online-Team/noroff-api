import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";
import { profileCore } from "../profiles/profiles.schema";

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z.string(),
});

const loginResponseSchema = z.object({
  ...profileCore,
  accessToken: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: socialAuthSchemas, $ref } = buildJsonSchemas({
  loginSchema,
  loginResponseSchema,
});
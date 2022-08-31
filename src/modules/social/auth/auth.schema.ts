import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const profileCore = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  name: z.string(),
};

const createProfileSchema = z.object({
  ...profileCore,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

const createProfileResponseSchema = z.object({
  id: z.number(),
  ...profileCore,
});

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
  accessToken: z.string(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export type LoginInput = z.infer<typeof loginSchema>;

export const { schemas: socialAuthSchemas, $ref } = buildJsonSchemas({
  createProfileSchema,
  createProfileResponseSchema,
  loginSchema,
  loginResponseSchema,
});
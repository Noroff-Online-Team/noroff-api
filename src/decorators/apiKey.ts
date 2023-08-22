import { FastifyRequest } from "fastify"
import { Unauthorized, BadRequest, Forbidden } from "http-errors"
import fp from "fastify-plugin"
import { db } from "@/utils"

export default fp(async fastify => {
  fastify.decorate("apiKey", async (request: FastifyRequest) => {
    try {
      // Get the API key from the request headers
      const apiKey = request.headers["x-noroff-api-key"]

      // If the API key is missing, return an error
      if (!apiKey) {
        throw new Unauthorized("API key required")
      }

      // If the API key is an array, return an error
      if (Array.isArray(apiKey)) {
        throw new BadRequest("API key must be a string")
      }

      // Find the key in the database
      const keyRecord = await db.apiKey.findUnique({
        where: { key: apiKey }
      })

      // If the key doesn't exist or is inactive, return an error
      if (!keyRecord || keyRecord.status !== "ACTIVE") {
        throw new Forbidden("Invalid API key")
      }
    } catch (error) {
      throw error
    }
  })
})

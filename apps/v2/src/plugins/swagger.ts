import swagger from "@fastify/swagger"
import fp from "fastify-plugin"
import { jsonSchemaTransform } from "fastify-type-provider-zod"

import { version } from "../../package.json"

export default fp(async fastify => {
  fastify.register(swagger, {
    swagger: {
      info: {
        title: "Noroff API",
        description: "Noroff API to be used in assignments",
        version
      },
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "status", description: "Health check endpoint" },
        { name: "auth", description: "Auth related endpoints" },
        { name: "books", description: "Books related endpoints" },
        { name: "cat-facts", description: "Cat Facts related endpoints" },
        { name: "jokes", description: "Jokes related endpoints" },
        { name: "nba-teams", description: "NBA teams related endpoints" },
        { name: "old-games", description: "Old games related endpoints" },
        { name: "e-com", description: "E-commerce related endpoints" },
        { name: "quotes", description: "Quotes related endpoints" },
        { name: "online-shop", description: "Online shop related endpoints" },
        {
          name: "social-profiles",
          description: "Social profiles related endpoints"
        },
        { name: "social-posts", description: "Social posts related endpoints" },
        {
          name: "auction-profiles",
          description: "Auction profiles related endpoints"
        },
        {
          name: "auction-listings",
          description: "Auction listings related endpoints"
        },
        {
          name: "holidaze-profiles",
          description: "Holidaze profiles related endpoints"
        },
        {
          name: "holidaze-venues",
          description: "Holidaze venues related endpoints"
        },
        {
          name: "holidaze-bookings",
          description: "Holidaze bookings related endpoints"
        },
        {
          name: "blog-posts",
          description: "Blog posts related endpoints"
        },
        {
          name: "pets",
          description: "Pets related endpoints"
        },
        {
          name: "artworks",
          description: "Artworks related endpoints"
        },
        {
          name: "library-books",
          description: "Library books related endpoints"
        }
      ],
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "X-Noroff-API-Key",
          in: "header",
          description: "Only paste the API key, no other text"
        },
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: 'Format "Bearer [token]"'
        }
      }
    },
    transform: jsonSchemaTransform
  })
})

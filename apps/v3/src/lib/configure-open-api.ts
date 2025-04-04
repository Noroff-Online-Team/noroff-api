import { apiReference } from "@scalar/hono-api-reference"

import type { AppOpenAPI } from "./types"

import packageJSON from "../../package.json" with { type: "json" }

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Noroff API v3"
    }
  })

  app.get(
    "/docs",
    apiReference({
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "fetch"
      },
      spec: {
        url: "/openapi.json"
      }
    })
  )
}

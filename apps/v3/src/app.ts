import configureOpenAPI from "@/lib/configure-open-api"
import createApp from "@/lib/create-app"
import index from "@/routes/index.route"

const app = createApp()

configureOpenAPI(app)

const routes = [index] as const

for (const route of routes) {
  app.route("/", route)
}

export type AppType = (typeof routes)[number]

export default app

import { serve } from "@hono/node-server"

import app from "./app"
import env from "./env"

const port = env.PORT

serve(
  {
    fetch: app.fetch,
    port
  },
  info => {
    console.log(`> Noroff API v3 listening on http://localhost:${info.port}`)
  }
)

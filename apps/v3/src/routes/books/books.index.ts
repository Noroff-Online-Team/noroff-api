import { createRouter } from "@/lib/create-app"

import * as handlers from "./books.handlers"
import * as routes from "./books.routes"

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.getRandom, handlers.getRandom)
  .openapi(routes.getOne, handlers.getOne)

export default router

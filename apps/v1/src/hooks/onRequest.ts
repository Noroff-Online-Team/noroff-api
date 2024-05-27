import fp from "fastify-plugin"

// Uses glob pattern
const TARGET_ENDPOINTS = [
  "/api/v1/social/profiles/*/follow",
  "/api/v1/social/profiles/*/unfollow"
]
const TARGET_METHODS = ["PUT"]

export default fp(async fastify => {
  fastify.addHook("onRequest", (req, reply, next) => {
    const contentType = req.headers["content-type"]
    const { method, url } = req

    // Convert glob pattern to regex pattern
    const patterns = TARGET_ENDPOINTS.map(
      pattern => new RegExp("^" + pattern.replace(/\*/g, "[^/]+") + "$")
    )
    const shouldRemoveHeader = patterns.some(pattern => pattern.test(url))
    const isTargetMethod = TARGET_METHODS.includes(method)

    if (
      contentType?.includes("application/json") &&
      shouldRemoveHeader &&
      isTargetMethod
    ) {
      delete req.headers["content-type"]
    }

    return next()
  })
})

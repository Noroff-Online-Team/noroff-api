import buildServer from "./server"

const server = buildServer()
const PORT = parseInt(process.env.PORT as string, 10) || 3000

// Main startup
async function main() {
  try {
    server.listen({ port: PORT, host: "0.0.0.0" }, () => console.log(`> Server listening on http://localhost:${PORT}`))
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()

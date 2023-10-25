import { pino } from "pino"
// import pinoLoki from "pino-loki"

const { LOKI_HOST_URL, LOKI_USERNAME, LOKI_PASSWORD, NODE_ENV } = process.env

interface CreateLoggerOptions {
  label?: string
}

/**
 * Create a logger instance
 * @param {object} options - Options for the logger
 * @param {string} [options.label=Noroff API] - Pino logger label (added to every log)
 * @returns A Pino logger instance with Loki transport
 */
export function createLogger({ label }: CreateLoggerOptions = { label: "Noroff API" }) {
  const isProduction = NODE_ENV === "production"

  if (isProduction && (!LOKI_HOST_URL || !LOKI_USERNAME || !LOKI_PASSWORD)) {
    throw new Error(
      "Missing environment variables for Loki. Please check that LOKI_HOST_URL, LOKI_USERNAME and LOKI_PASSWORD are set."
    )
  }

  switch (NODE_ENV) {
    case "production":
      return pino({
        transport: {
          targets: [
            {
              target: "pino-loki",
              level: "info",
              options: {
                batching: true,
                labels: { application: label },
                host: process.env.LOKI_HOST_URL!,
                basicAuth: {
                  username: process.env.LOKI_USERNAME!,
                  password: process.env.LOKI_PASSWORD!
                }
              }
            },
            {
              target: "pino-pretty",
              level: "info",
              options: {}
            }
          ]
        }
      })
    case "development":
      return pino({
        transport: {
          target: "pino-pretty",
          level: "info",
          options: {}
        }
      })
    case "test":
      return pino({ enabled: false })
    default:
      return pino({
        transport: {
          target: "pino-pretty",
          level: "info",
          options: {}
        }
      })
  }
}

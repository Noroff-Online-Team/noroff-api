import { pino } from "pino"

const { NODE_ENV } = process.env

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
  switch (NODE_ENV) {
    case "test":
      return pino({ level: "silent" })
    case "development":
      return pino({
        transport: {
          targets: [
            {
              target: "pino-pretty",
              level: "debug",
              options: {
                colorize: true,
                ignore: "pid,hostname"
              }
            }
          ]
        }
      })
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
                host: "http://noroff-loki:3100"
              }
            }
          ]
        }
      })
    default:
      return pino({ level: "silent" })
  }
}

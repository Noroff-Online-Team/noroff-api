import { pino } from "pino"

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
  if (process.env.NODE_ENV === "test") return pino({ level: "silent" })

  if (!process.env.LOKI_HOST) throw new Error("LOKI_HOST environment variable is required to create a logger")

  return pino({
    transport: {
      targets: [
        {
          target: "pino-loki",
          level: "info",
          options: {
            batching: true,
            labels: { application: label },
            host: process.env.LOKI_HOST
          }
        }
      ]
    }
  })
}

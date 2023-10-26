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
  return pino({
    transport: {
      targets: [
        {
          target: "pino-loki",
          level: "info",
          options: {
            batching: true,
            labels: { application: label },
            host: "http://loki:3100"
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
}

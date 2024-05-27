const classes = {
  GET: "ring-green-300 dark:ring-green-500/30 bg-green-400/10 text-green-700 dark:text-green-300",
  POST: "ring-blue-300 dark:ring-blue-500/30 bg-blue-400/10 text-blue-700 dark:text-blue-300",
  PUT: "ring-yellow-300 dark:ring-yellow-500/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300",
  PATCH:
    "ring-yellow-300 dark:ring-yellow-500/30 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300",
  DELETE:
    "ring-red-300 dark:ring-red-500/30 bg-red-400/10 text-red-700 dark:text-red-300"
}

/**
 * Endpoint method and path component
 * @param {object} props - Component props
 * @param {string} props.method - HTTP method of the endpoint (GET, POST, PUT, PATCH, DELETE) (default: GET)
 * @param {string} props.path - Path of the endpoint (e.g. /jokes/random)
 */
export function EndpointDetails({
  method = "GET",
  path
}: {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
}) {
  return (
    <div className="flex items-center mt-4 font-mono font-semibold gap-x-2">
      <span
        className={`leading-6 rounded-lg text-[0.75rem] px-2 py-0.5 ring-1 ring-inset ${classes[method]}`}
      >
        {method}
      </span>
      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
      <span className="font-medium tracking-tight text-zinc-700 dark:text-zinc-300">
        {path}
      </span>
    </div>
  )
}

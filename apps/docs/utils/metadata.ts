export const base_url =
  process.env.NODE_ENV === "development" ? new URL("http://localhost:3002") : new URL(`https://docs.noroff.dev`)

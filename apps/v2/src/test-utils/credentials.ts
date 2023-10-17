import { server } from "./server"

const TEST_USER_NAME = "test_user"
const TEST_USER_EMAIL = "test_user@noroff.no"
const TEST_USER_PASSWORD = "password"

type User = {
  name?: string
  email?: string
  password?: string
}

/**
 * Register, login, and create API key for user. Uses default user credentials if none are provided.
 * @returns Bearer token, API key, name, and email
 */
export async function getAuthCredentials(user: User = {}): Promise<{
  bearerToken: string
  apiKey: string
  name: string
  email: string
  password: string
}> {
  const { name = TEST_USER_NAME, email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD } = user

  try {
    // Register user
    await registerUser({ name, email, password })

    // Login user
    const { bearerToken } = await loginUser({ email, password })

    // Create API key
    const apiKeyResponse = await server.inject({
      url: "/auth/create-api-key",
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    })
    const apiKey = apiKeyResponse.json().data.key

    return { bearerToken, apiKey, name, email, password }
  } catch (error) {
    console.error("Error obtaining credentials:", error)
    throw error
  }
}

/**
 * Register user. Uses default user credentials if none are provided.
 * @returns Registered user's name and email
 */
export async function registerUser(user: User = {}): Promise<{ name: string; email: string; password: string }> {
  const { name = TEST_USER_NAME, email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD } = user

  try {
    await server.inject({
      url: "/auth/register",
      method: "POST",
      payload: { name, email, password }
    })

    return { name, email, password }
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

async function loginUser(user: User = {}): Promise<{ bearerToken: string }> {
  const { email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD } = user

  try {
    const response = await server.inject({
      url: "/auth/login",
      method: "POST",
      payload: { email, password }
    })

    return {
      bearerToken: response.json().data.accessToken
    }
  } catch (error) {
    console.error("Error logging in user:", error)
    throw error
  }
}

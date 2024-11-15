export const API_KEY_HEADER_NOT_FOUND = "No API key header was found"
export const AUTHORIZATION_HEADER_NOT_FOUND =
  "No authorization header was found"

export function createMediaExpectation() {
  return expect.objectContaining({
    url: expect.any(String),
    alt: expect.any(String)
  })
}

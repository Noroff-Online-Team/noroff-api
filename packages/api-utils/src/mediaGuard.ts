import { BadRequest } from "http-errors"

/**
 * Checks if the image is accessible
 * @param imageUrl - The image URL
 * @returns - Returns true if the image is accessible, false otherwise
 */
export async function validateImageURL(imageUrl: string) {
  try {
    const response = await fetch(imageUrl)
    return response.status == 200
  } catch {
    return false
  }
}

/**
 * Checks if the image is accessible
 * @param imageURL - The image URL
 * @throws {BadRequest} - Throws an error if the image is not accessible
 */
export async function mediaGuard(imageURL?: string | null) {
  if (imageURL) {
    if (!(await validateImageURL(imageURL))) {
      throw new BadRequest(`Image is not accessible, please double check the image address: ${imageURL}`)
    }
  }
}

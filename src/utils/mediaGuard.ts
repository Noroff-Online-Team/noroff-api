import Axios from "axios"
import { BadRequest } from "http-errors"

export async function validateImageURL(imageUrl: string) {
  try {
    return (await Axios.get(imageUrl)).status == 200
  } catch {
    return false
  }
}

export async function mediaGuard(imageURL?: string | null) {
  if (imageURL) {
    if (!(await validateImageURL(imageURL))) {
      throw new BadRequest(`Image is not accessible, please double check the image address: ${imageURL}`)
    }
  }
}

import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const PET_ID = "b8e7e4e6-9a11-4f64-8462-c16250d101e1"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

beforeEach(async () => {
  const { name, bearerToken, apiKey } = await getAuthCredentials()
  const { bearerToken: secondBearerToken } = await getAuthCredentials({
    name: "test_user_two",
    email: "test_user_two@noroff.no"
  })

  USER_NAME = name
  BEARER_TOKEN = bearerToken
  SECOND_BEARER_TOKEN = secondBearerToken
  API_KEY = apiKey

  await db.pet.create({
    data: {
      id: PET_ID,
      name: "Fluffy",
      species: "Dog",
      breed: "Golden Retriever",
      age: 3,
      gender: "Male",
      size: "Large",
      color: "Golden",
      description: "A friendly dog who loves playing fetch",
      adoptionStatus: "Available",
      location: "Oslo Animal Shelter",
      ownerName: USER_NAME
    }
  })
})

afterEach(async () => {
  const pets = db.pet.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([pets, users, media])
  await db.$disconnect()
})

describe("[DELETE] /pets/:id", () => {
  it("should return 204 when successfully deleted a pet", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(204)

    const checkPetResponse = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "GET",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })
    expect(checkPetResponse.statusCode).toBe(404)
  })

  it("should throw 404 error if pet does not exist", async () => {
    const response = await server.inject({
      url: "/pets/a9f8e5d4-3c2b-1f0e-9d8c-7b6a5e4d3c2b",
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "Pet not found"
    })
  })

  it("should throw 403 if trying to delete someone else's pet", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(403)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "You are not the owner of this pet"
    })
  })

  it("should require authentication", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "DELETE",
      headers: {
        "X-Noroff-API-Key": API_KEY
      }
    })

    expect(response.statusCode).toBe(401)
  })
})

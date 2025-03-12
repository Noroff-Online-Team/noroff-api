import { getAuthCredentials, server } from "@/test-utils"

import { db } from "@/utils"

const PET_ID = "39b3d7a7-eae9-4fc0-a34f-3a466c9078d9"
let BEARER_TOKEN = ""
let SECOND_BEARER_TOKEN = ""
let API_KEY = ""
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&fit=crop",
  alt: "A German Shepherd dog"
}

const originalData = {
  name: "Fluffy",
  species: "Dog",
  breed: "Golden Retriever",
  age: 3
}

const updateData = {
  name: "Fluffy Jr.",
  age: 4,
  adoptionStatus: "Adopted"
}

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
      ...originalData,
      gender: "Male",
      size: "Large",
      color: "Golden",
      description: "A friendly dog who loves playing fetch",
      adoptionStatus: "Available",
      location: "Oslo Animal Shelter",
      dateAdded: new Date(),
      image: { create: DEFAULT_IMAGE },
      owner: { connect: { name: USER_NAME } }
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

describe("[PUT] /pets/:id", () => {
  it("should return 200 when successfully updated a pet", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(PET_ID)
    expect(res.data.name).toBe("Fluffy Jr.")
    expect(res.data.age).toBe(4)
    expect(res.data.adoptionStatus).toBe("Adopted")
    expect(res.data.species).toBe("Dog")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if pet does not exist", async () => {
    const response = await server.inject({
      url: "/pets/a9f8e5d4-3c2b-1f0e-9d8c-7b6a5e4d3c2b",
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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

  it("should throw 403 if trying to update someone else's pet", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${SECOND_BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        ...updateData
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

  it("should throw validation error if update data is invalid", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {
        age: -1
      }
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toContainEqual(
      expect.objectContaining({
        message: "Age must be a positive number"
      })
    )
  })

  it("should throw error if no fields are provided to update", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "X-Noroff-API-Key": API_KEY
      },
      payload: {}
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors).toStrictEqual([
      {
        code: "custom",
        message: "You must provide at least one field to update",
        path: []
      }
    ])
  })
})

import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

const PET_ID = "5d366279-e68b-4331-a31f-dc1575acd34e"
const NONEXISTENT_PET_ID = "c14d2ba8-4a94-47dc-9f33-6d32500cf116"
let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&fit=crop",
  alt: "A German Shepherd dog"
}

beforeEach(async () => {
  const { name } = await registerUser()

  USER_NAME = name

  // Create test pet
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

describe("[GET] /pets/:id", () => {
  it("should return single pet based on id", async () => {
    const response = await server.inject({
      url: `/pets/${PET_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toMatchObject({
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
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      },
      owner: {
        name: USER_NAME
      }
    })
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if pet not found", async () => {
    const response = await server.inject({
      url: `/pets/${NONEXISTENT_PET_ID}`,
      method: "GET"
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

  it("should throw zod error if id is not a valid UUID", async () => {
    const response = await server.inject({
      url: "/pets/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_string",
      message: "Invalid uuid",
      path: ["id"]
    })
  })
})

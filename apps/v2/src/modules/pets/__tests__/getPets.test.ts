import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&fit=crop",
  alt: "A German Shepherd dog"
}

beforeEach(async () => {
  const { name } = await registerUser()

  USER_NAME = name

  // Create test pets
  await db.pet.create({
    data: {
      id: "b8e7e4e6-9a11-4f64-8462-c16250d101e1",
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
      dateAdded: new Date(),
      image: { create: DEFAULT_IMAGE },
      owner: { connect: { name: USER_NAME } }
    }
  })
  await db.pet.create({
    data: {
      id: "c4f7e5e9-1b22-5f75-9573-d17340e202f2",
      name: "Whiskers",
      species: "Cat",
      breed: "Siamese",
      age: 2,
      gender: "Female",
      size: "Medium",
      color: "Cream",
      description: "A curious cat who loves to explore",
      adoptionStatus: "Available",
      location: "Bergen Pet Center",
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

describe("[GET] /pets", () => {
  it("should return all pets", async () => {
    const response = await server.inject({
      url: "/pets",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].name).toBe("Whiskers")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].name).toBe("Fluffy")
    expect(res.meta).toBeDefined()
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return pets with sorting", async () => {
    const response = await server.inject({
      url: "/pets?sort=name&sortOrder=asc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].name).toBe("Fluffy")
    expect(res.data[1].name).toBe("Whiskers")
  })

  it("should handle pagination", async () => {
    const response = await server.inject({
      url: "/pets?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: false,
      currentPage: 1,
      previousPage: null,
      nextPage: 2,
      pageCount: 2,
      totalCount: 2
    })
  })
})

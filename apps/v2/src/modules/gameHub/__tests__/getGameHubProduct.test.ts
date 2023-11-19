import { server } from "@/test-utils"

import { db } from "@/utils"

const PRODUCT_ID = "ded6041a-622f-4fb4-81e4-96fcfdad4dff"

beforeEach(async () => {
  await db.gameHubProducts.create({
    data: {
      id: PRODUCT_ID,
      title: "Ping Pong Championship",
      description:
        "Enter the world of Ping Pong Championship and compete against the world's best to become the ultimate champion in this exciting game.",
      genre: "Sports",
      released: "2005",
      ageRating: "3+",
      price: 14.99,
      discountedPrice: 4.79,
      onSale: true,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/api/gamehub/0-ping-pong-championship.jpg",
          alt: ""
        }
      },
      tags: ["gamehub", "game"],
      favorite: true
    }
  })
  await db.gameHubProducts.create({
    data: {
      title: "Super Duper",
      description: "Celebrate some of the world's supe duper Superheroes with augmented reality.",
      genre: "Adventure",
      released: "2006",
      ageRating: "3+",
      price: 15.99,
      discountedPrice: 15.99,
      onSale: false,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/api/gamehub/1-super-duper.jpg",
          alt: ""
        }
      },
      tags: ["gamehub", "game"],
      favorite: true
    }
  })
})

afterEach(async () => {
  const gameHubProducts = db.gameHubProducts.deleteMany()

  await db.$transaction([gameHubProducts])
  await db.$disconnect()
})

describe("[GET] /gamehub/:id", () => {
  it("should return single gamehub product based on id", async () => {
    const response = await server.inject({
      url: `/gamehub/${PRODUCT_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(PRODUCT_ID)
    expect(res.data.title).toBe("Ping Pong Championship")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if gamehub product not found", async () => {
    const response = await server.inject({
      url: "/gamehub/c15cda6e-44d7-11ee-be56-0242ac120002",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No product with such ID"
    })
  })

  it("should throw zod error if id is not an uuid", async () => {
    const response = await server.inject({
      url: "/gamehub/invalid_id",
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
      message: "ID must be a valid UUID",
      path: ["id"]
    })
  })
})

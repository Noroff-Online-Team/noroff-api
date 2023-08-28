import { server } from "@/tests/server"
import { db } from "@/utils"

beforeEach(async () => {
  await db.gameHubProducts.createMany({
    data: [
      {
        id: "ded6041a-622f-4fb4-81e4-96fcfdad4dff",
        title: "Ping Pong Championship",
        description:
          "Enter the world of Ping Pong Championship and compete against the world's best to become the ultimate champion in this exciting game.",
        genre: "Sports",
        released: "2005",
        ageRating: "3+",
        price: 14.99,
        discountedPrice: 4.79,
        onSale: true,
        image: "https://api.noroff.dev/images/gamehub/0-ping-pong-championship.jpg",
        tags: ["gamehub", "game"],
        favorite: true
      },
      {
        id: "2ace4e1d-cad7-4d35-8d59-6c9ac3e3eaf8",
        title: "Super Duper",
        description: "Celebrate some of the world's supe duper Superheroes with augmented reality.",
        genre: "Adventure",
        released: "2006",
        ageRating: "3+",
        price: 15.99,
        discountedPrice: 15.99,
        onSale: false,
        image: "https://api.noroff.dev/images/gamehub/1-super-duper.jpg",
        tags: ["gamehub", "game"],
        favorite: true
      }
    ]
  })
})

afterEach(async () => {
  const gameHubProducts = db.gameHubProducts.deleteMany()

  await db.$transaction([gameHubProducts])
  await db.$disconnect()
})

describe("[GET] /v2/gamehub/:id", () => {
  it("should return single gamehub product based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub/ded6041a-622f-4fb4-81e4-96fcfdad4dff",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("Ping Pong Championship")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return 404 if gamehub product not found", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub/c15cda6e-44d7-11ee-be56-0242ac120002",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("No product with such ID")
  })

  it("should throw zod error if id is not an uuid", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("ID must be a valid UUID")
  })
})

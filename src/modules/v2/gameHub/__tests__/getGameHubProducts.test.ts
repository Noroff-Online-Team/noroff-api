import { server } from "@/test-utils"
import { db } from "@/utils"

beforeEach(async () => {
  await db.gameHubProducts.createMany({
    data: [
      {
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

describe("[GET] /v2/gamehub", () => {
  it("should return all gamehub products", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[1].id).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all gamehub products with sort", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub?sort=title&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].title).toBe("Super Duper")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].title).toBe("Ping Pong Championship")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return all gamehub products with pagination", async () => {
    const response = await server.inject({
      url: "/api/v2/gamehub?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
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

import { server } from "@/test-utils"
import { db } from "@/utils"

beforeEach(async () => {
  // createMany doesn't support creating relations, so instead we create two products separately.
  await db.onlineShopProduct.create({
    data: {
      id: "98660fe4-a14d-4882-9bdf-6de07eac5587",
      title: "Vanilla Perfume",
      description: "Women's perfume that smells a warm and sweet, with nuances of wood and jasmine.",
      price: 2599.99,
      discountedPrice: 2079.99,
      imageUrl: "https://static.cloud.noroff.dev/public/online-shop/1-perfume-white.jpg",
      rating: 5,
      tags: ["perfume", "beauty"],
      reviews: {
        create: [
          {
            username: "Jim N.",
            rating: 5,
            description: "My partner loves it, its her favourite."
          }
        ]
      }
    }
  })

  await db.onlineShopProduct.create({
    data: {
      id: "d5991e95-eb59-49d1-8c6b-e399cab2ea8e",
      title: "Toy car",
      description: "A die-cast model of a toy car, perfect for displaying on your shelf.",
      price: 499.95,
      discountedPrice: 449.95,
      imageUrl: "https://static.cloud.noroff.dev/public/online-shop/12-toy-car.jpg",
      rating: 0,
      tags: ["toy"]
    }
  })
})

afterEach(async () => {
  const onlineShopReview = db.onlineShopReview.deleteMany()
  const onlineShopProduct = db.onlineShopProduct.deleteMany()

  await db.$transaction([onlineShopReview, onlineShopProduct])
  await db.$disconnect()
})

describe("[GET] /v2/online-shop", () => {
  it("should return all online shop products", async () => {
    const response = await server.inject({
      url: "/api/v2/online-shop",
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

  // TODO: Need to implement support for pagination.
  it.skip("should return all online shop products with pagination", async () => {
    const response = await server.inject({
      url: "/api/v2/online-shop?page=1&limit=1",
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
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 2,
      totalCount: 2
    })
  })
})

import { server } from "@/tests/server"
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

describe("[GET] /v2/online-shop/:id", () => {
  it("should return single online shop product and review based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/online-shop/98660fe4-a14d-4882-9bdf-6de07eac5587",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("Vanilla Perfume")
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

  it("should return 404 if online shop product not found", async () => {
    const response = await server.inject({
      url: "/api/v2/online-shop/c375b240-037e-4408-ac39-1063010d48fe",
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

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/api/v2/online-shop/invalid_id",
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

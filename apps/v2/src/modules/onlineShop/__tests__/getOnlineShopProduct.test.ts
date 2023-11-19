import { server } from "@/test-utils"

import { db } from "@/utils"

const PRODUCT_ID = "98660fe4-a14d-4882-9bdf-6de07eac5587"

beforeEach(async () => {
  // createMany doesn't support creating relations, so instead we create two products separately.
  await db.onlineShopProduct.create({
    data: {
      id: PRODUCT_ID,
      title: "Vanilla Perfume",
      description: "Women's perfume that smells a warm and sweet, with nuances of wood and jasmine.",
      price: 2599.99,
      discountedPrice: 2079.99,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/online-shop/1-perfume-white.jpg",
          alt: ""
        }
      },
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
      title: "Toy car",
      description: "A die-cast model of a toy car, perfect for displaying on your shelf.",
      price: 499.95,
      discountedPrice: 449.95,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/online-shop/12-toy-car.jpg",
          alt: ""
        }
      },
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

describe("[GET] /online-shop/:id", () => {
  it("should return single online shop product with reviews based on id", async () => {
    const response = await server.inject({
      url: `/online-shop/${PRODUCT_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBe(PRODUCT_ID)
    expect(res.data.title).toBe("Vanilla Perfume")
    expect(res.data.reviews).toBeDefined()
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if online shop product not found", async () => {
    const response = await server.inject({
      url: "/online-shop/c375b240-037e-4408-ac39-1063010d48fe",
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

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/online-shop/invalid_id",
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

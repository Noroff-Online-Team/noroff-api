import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.onlineShopProduct.create({
    data: {
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

describe("[GET] /online-shop", () => {
  it("should return all online shop products", async () => {
    const response = await server.inject({
      url: "/online-shop",
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

  it("should return all online shop products with sort", async () => {
    const response = await server.inject({
      url: "/online-shop?sort=title&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].title).toBe("Vanilla Perfume")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].title).toBe("Toy car")
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

  it("should return all online shop products with pagination", async () => {
    const response = await server.inject({
      url: "/online-shop?page=1&limit=1",
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

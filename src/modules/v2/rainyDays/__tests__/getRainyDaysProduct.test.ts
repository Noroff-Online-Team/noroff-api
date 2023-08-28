import { server } from "@/tests/server"
import { db } from "@/utils"

beforeEach(async () => {
  await db.rainyDaysProduct.createMany({
    data: [
      {
        id: "07a7655a-7927-421b-ba6a-b6742d5a75b8",
        title: "Rainy Days Thunderbolt Jacket",
        description:
          "The Women's Rainy Days Thunderbolt jacket is a sleek and stylish waterproof jacket perfect for any outdoor adventure.",
        gender: "Female",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        baseColor: "Black",
        price: 139.99,
        discountedPrice: 139.99,
        onSale: false,
        image: "https://static.cloud.noroff.dev/public/rainy-days/9-thunderbolt-jacket.jpg",
        tags: ["jacket", "womens"],
        favorite: false
      },
      {
        id: "298d6c5f-5445-4581-9ff5-be921f4ce37c",
        title: "Rainy Days Habita Jacket",
        description:
          "The Women's Rainy Days Habita jacket is a relaxed fit with breathable material that is a packable answer to uncertain weather.",
        gender: "Female",
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        baseColor: "Black",
        price: 129.99,
        discountedPrice: 129.99,
        onSale: false,
        image: "https://static.cloud.noroff.dev/public/rainy-days/3-habita-jacket.jpg",
        tags: ["jacket", "womens"],
        favorite: true
      }
    ]
  })
})

afterEach(async () => {
  const rainyDaysProduct = db.rainyDaysProduct.deleteMany()

  await db.$transaction([rainyDaysProduct])
  await db.$disconnect()
})

describe("[GET] /v2/rainy-days/:id", () => {
  it("should return single rainy days product and review based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/rainy-days/07a7655a-7927-421b-ba6a-b6742d5a75b8",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("Rainy Days Thunderbolt Jacket")
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

  it("should return 404 if rainy days product not found", async () => {
    const response = await server.inject({
      url: "/api/v2/rainy-days/c375b240-037e-4408-ac39-1063010d48fe",
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
      url: "/api/v2/rainy-days/invalid_id",
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

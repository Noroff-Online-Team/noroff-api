import { server } from "@/test-utils"

import { db } from "@/utils"

const PRODUCT_ID = "04fd79ad-2612-4dab-b2ee-1320c4e5ccd1"

beforeEach(async () => {
  await db.squareEyesProduct.create({
    data: {
      id: PRODUCT_ID,
      title: "The Mandalorian",
      description:
        "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
      genre: "Action",
      rating: "8.8",
      released: "2019",
      price: 124.99,
      discountedPrice: 124.99,
      onSale: false,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/square-eyes/10-mandalorian.jpg",
          alt: ""
        }
      },
      tags: ["gamehub", "game"],
      favorite: true
    }
  })
  await db.squareEyesProduct.create({
    data: {
      title: "Hobbs & Shaw",
      description:
        "Lawman Luke Hobbs (Dwayne 'The Rock' Johnson) and outcast Deckard Shaw (Jason Statham) form an unlikely alliance when a cyber-genetically enhanced villain threatens the future of humanity.",
      genre: "Action",
      rating: "6.5",
      released: "2019",
      price: 129.99,
      discountedPrice: 119.99,
      onSale: true,
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/square-eyes/0-hobbs-and-shaw.jpg",
          alt: ""
        }
      },
      tags: ["gamehub", "game"],
      favorite: true
    }
  })
})

afterEach(async () => {
  const squareEyesProduct = db.squareEyesProduct.deleteMany()

  await db.$transaction([squareEyesProduct])
  await db.$disconnect()
})

describe("[GET] /square-eyes/:id", () => {
  it("should return single square eyes product and review based on id", async () => {
    const response = await server.inject({
      url: `/square-eyes/${PRODUCT_ID}`,
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("The Mandalorian")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if square eyes product not found", async () => {
    const response = await server.inject({
      url: "/square-eyes/c375b240-037e-4408-ac39-1063010d48fe",
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
      url: "/square-eyes/invalid_id",
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

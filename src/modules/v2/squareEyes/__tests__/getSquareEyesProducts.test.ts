import { server } from "@/tests/server"
import { db } from "@/utils"

beforeEach(async () => {
  await db.squareEyesProduct.createMany({
    data: [
      {
        id: "04fd79ad-2612-4dab-b2ee-1320c4e5ccd1",
        title: "The Mandalorian",
        description:
          "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
        genre: "Action",
        rating: "8.8",
        released: "2019",
        price: 124.99,
        discountedPrice: 124.99,
        onSale: false,
        image: "https://static.cloud.noroff.dev/public/square-eyes/10-mandalorian.jpg",
        tags: ["gamehub", "game"],
        favorite: true
      },
      {
        id: "352ba432-5b5d-4ccc-9aba-f2704c500cf3",
        title: "Hobbs & Shaw",
        description:
          "Lawman Luke Hobbs (Dwayne 'The Rock' Johnson) and outcast Deckard Shaw (Jason Statham) form an unlikely alliance when a cyber-genetically enhanced villain threatens the future of humanity.",
        genre: "Action",
        rating: "6.5",
        released: "2019",
        price: 129.99,
        discountedPrice: 119.99,
        onSale: true,
        image: "https://static.cloud.noroff.dev/public/square-eyes/0-hobbs-and-shaw.jpg",
        tags: ["gamehub", "game"],
        favorite: true
      }
    ]
  })
})

afterEach(async () => {
  const squareEyesProduct = db.squareEyesProduct.deleteMany()

  await db.$transaction([squareEyesProduct])
  await db.$disconnect()
})

describe("[GET] /v2/square-eyes", () => {
  it("should return all square eyes products", async () => {
    const response = await server.inject({
      url: "/api/v2/square-eyes",
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
  it.skip("should return all square eyes products with pagination", async () => {
    const response = await server.inject({
      url: "/api/v2/square-eyes?page=1&limit=1",
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

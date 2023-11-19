import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "Book_id_seq" RESTART WITH 1;`
  await db.book.create({
    data: {
      title: "Big Trouble in Town",
      author: "Jermain Hudson",
      genre: "Voluptatibus",
      description:
        "Alice, they all spoke at once, with a shiver. 'I beg pardon, your Majesty,' said the Caterpillar. This was such a noise inside, no one to listen to me! I'LL soon make you dry enough!' They all sat.",
      isbn: "9785699252138",
      image: {
        create: {
          url: "http://placeimg.com/480/640/any",
          alt: ""
        }
      },
      published: "2012-01-08",
      publisher: "Voluptates Nihil"
    }
  })
  await db.book.create({
    data: {
      title: "The Next Day",
      author: "Pattie Hagenes",
      genre: "Dolor",
      description:
        "Rabbit angrily. 'Here! Come and help me out of the tea--' 'The twinkling of the conversation. Alice replied, so eagerly that the cause of this pool? I am to see that queer little toss of her ever.",
      isbn: "9798692336644",
      image: {
        create: {
          url: "http://placeimg.com/480/640/any",
          alt: ""
        }
      },
      published: "1977-03-03",
      publisher: "Blanditiis Labore"
    }
  })
})

afterEach(async () => {
  const book = db.book.deleteMany()

  await db.$transaction([book])
  await db.$disconnect()
})

describe("[GET] /books/:id", () => {
  it("should return single book based on id", async () => {
    const response = await server.inject({
      url: "/books/1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.title).toBe("Big Trouble in Town")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({})
  })

  it("should return 404 if book not found", async () => {
    const response = await server.inject({
      url: "/books/3",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      message: "No book with such ID"
    })
  })

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/books/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0]).toStrictEqual({
      code: "invalid_type",
      message: "ID must be a number",
      path: ["id"]
    })
  })
})

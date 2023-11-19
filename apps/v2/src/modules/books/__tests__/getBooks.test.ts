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

describe("[GET] /books", () => {
  it("should return all books", async () => {
    const response = await server.inject({
      url: "/books",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].title).toBe("Big Trouble in Town")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].title).toBe("The Next Day")
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

  it("should return all books with sort", async () => {
    const response = await server.inject({
      url: "/books?sort=title&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].title).toBe("The Next Day")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].title).toBe("Big Trouble in Town")
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

  it("should return all books with pagination", async () => {
    const response = await server.inject({
      url: "/books?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].title).toBe("Big Trouble in Town")
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

import { server } from "@/test-utils"

import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "OldGame_id_seq" RESTART WITH 1;`
  await db.oldGame.create({
    data: {
      slug: "the-incredible-machine",
      name: "The Incredible Machine",
      description:
        "Undoubtedly one of the most unique games ever produced for the PC, The Incredible Machines 1 is a dream come true for anyone who as a child likes to tinker with gadgets and toys. It is a puzzle game par excellence and beyond: you have to use wacky gadgets and tools given for each level to accomplish objectives. Puzzles start out relaxing and get fiendish very quickly, as later levels require not only ingenuity but also precise timing. A true classic.",
      released: "1993",
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/old-games/the-incredible-machine.png",
          alt: ""
        }
      },
      genre: ["Puzzle"]
    }
  })
  await db.oldGame.create({
    data: {
      slug: "lemmings",
      name: "Lemmings",
      description:
        "Lemmings, one the most famous game in the nineties. You are in charge of a group of lemmings on their way to their home. Inspired from the legend of the dumb lemming running straight in to danger, the lemmings pop from a portal and walk straight until they find an obstacle. The goal is to build a way to the exit with minimum casualties along the way. Of course dangers are everywhere : pitfall, traps, cliffs, etc...   Hopefully, the lemmings are able to make a lot of things, but you have to tell them to do it. Lemmings can make their fellow friends stop and turn around, build bridges, use an umbrella to fall slowly and much more. With a clever use of the often limited number of abilities, you may lead the lemmings to the exit.",
      released: "1991",
      image: {
        create: {
          url: "https://static.cloud.noroff.dev/public/old-games/lemmings.gif",
          alt: ""
        }
      },
      genre: ["Action", "Puzzle"]
    }
  })
})

afterEach(async () => {
  const oldGame = db.oldGame.deleteMany()

  await db.$transaction([oldGame])
  await db.$disconnect()
})

describe("[GET] /old-games", () => {
  it("should return all old games", async () => {
    const response = await server.inject({
      url: "/old-games",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].slug).toBe("the-incredible-machine")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].slug).toBe("lemmings")
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

  it("should return all old games with sort", async () => {
    const response = await server.inject({
      url: "/old-games?sort=name&sortOrder=desc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(2)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].name).toBe("The Incredible Machine")
    expect(res.data[1].id).toBeDefined()
    expect(res.data[1].name).toBe("Lemmings")
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

  it("should return all old games with pagination", async () => {
    const response = await server.inject({
      url: "/old-games?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBeDefined()
    expect(res.data[0].slug).toBe("the-incredible-machine")
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

import { registerUser, server } from "@/test-utils"

import { db } from "@/utils"

let USER_NAME = ""

const DEFAULT_IMAGE = {
  url: "https://images.unsplash.com/photo-1562785072-c65ab858fcbc?q=80&w=800&fit=crop",
  alt: "A surreal masterpiece"
}

beforeEach(async () => {
  const { name } = await registerUser()

  USER_NAME = name

  // Create test artworks
  await db.artwork.create({
    data: {
      id: "b8e7e4e6-9a11-4f64-8462-c16250d101e1",
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      year: 1931,
      medium: "Oil on canvas",
      description:
        "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
      location: "Museum of Modern Art, New York",
      image: { create: DEFAULT_IMAGE },
      owner: { connect: { name: USER_NAME } }
    }
  })
  await db.artwork.create({
    data: {
      id: "c4f7e5e9-1b22-5f75-9573-d17340e202f2",
      title: "Starry Night",
      artist: "Vincent van Gogh",
      year: 1889,
      medium: "Oil on canvas",
      description:
        "One of Van Gogh's most famous paintings, depicting a swirling night sky over a small town.",
      location: "Museum of Modern Art, New York",
      image: { create: DEFAULT_IMAGE },
      owner: { connect: { name: USER_NAME } }
    }
  })
})

afterEach(async () => {
  const artworks = db.artwork.deleteMany()
  const users = db.userProfile.deleteMany()
  const media = db.media.deleteMany()

  await db.$transaction([artworks, users, media])
  await db.$disconnect()
})

describe("[GET] /artworks", () => {
  it("should return all artworks", async () => {
    const response = await server.inject({
      url: "/artworks",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
    expect(res.data[0]).toMatchObject({
      id: "b8e7e4e6-9a11-4f64-8462-c16250d101e1",
      title: "The Persistence of Memory",
      artist: "Salvador Dalí",
      year: 1931,
      medium: "Oil on canvas",
      description:
        "A surreal masterpiece famous for its depiction of melting clocks in a dreamlike landscape.",
      location: "Museum of Modern Art, New York",
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      }
    })
    expect(res.data[1]).toMatchObject({
      id: "c4f7e5e9-1b22-5f75-9573-d17340e202f2",
      title: "Starry Night",
      artist: "Vincent van Gogh",
      year: 1889,
      medium: "Oil on canvas",
      description:
        "One of Van Gogh's most famous paintings, depicting a swirling night sky over a small town.",
      location: "Museum of Modern Art, New York",
      image: {
        url: DEFAULT_IMAGE.url,
        alt: DEFAULT_IMAGE.alt
      },
      owner: {
        name: USER_NAME
      }
    })
    expect(res.meta).toMatchObject({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 2
    })
  })

  it("should return artworks with sorting", async () => {
    const response = await server.inject({
      url: "/artworks?sort=title&sortOrder=asc",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(2)
    expect(res.data[0].title).toBe("Starry Night")
    expect(res.data[1].title).toBe("The Persistence of Memory")
  })

  it("should handle pagination", async () => {
    const response = await server.inject({
      url: "/artworks?page=1&limit=1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toHaveLength(1)
    expect(res.meta).toMatchObject({
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

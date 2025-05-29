import type { LibraryBook, LibraryBookReview, Prisma } from "@prisma/v2-client"

import { db } from "@/utils"
import type {
  CreateLibraryBookReviewSchema,
  CreateLibraryBookSchema,
  UpdateLibraryBookReviewSchema,
  UpdateLibraryBookSchema
} from "./libraryBooks.schema"

export async function getLibraryBooks(
  sort: keyof LibraryBook = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.libraryBook
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        image: true,
        owner: { include: { avatar: true, banner: true } },
        reviews: {
          include: {
            reviewer: { include: { avatar: true, banner: true } }
          }
        }
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getLibraryBook(id: string) {
  const [data] = await db.libraryBook
    .paginate({
      where: { id },
      include: {
        image: true,
        owner: { include: { avatar: true, banner: true } },
        reviews: {
          include: {
            reviewer: { include: { avatar: true, banner: true } }
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createLibraryBook(
  ownerName: string,
  createData: CreateLibraryBookSchema
) {
  const { image, ...restData } = createData
  const { metadata, ...coreData } = restData

  const data = await db.libraryBook.create({
    data: {
      ...coreData,
      metadata,
      ownerName,
      image: image?.url ? { create: image } : undefined
    },
    include: {
      image: true,
      owner: { include: { avatar: true, banner: true } },
      reviews: {
        include: { reviewer: { include: { avatar: true, banner: true } } }
      }
    }
  })

  return { data }
}

export async function updateLibraryBook(
  id: string,
  updateData: UpdateLibraryBookSchema
) {
  const { image, metadata, ...restData } = updateData

  let updatedMetadata: Prisma.JsonObject | undefined = undefined

  if (metadata) {
    const currentBook = await db.libraryBook.findUnique({
      where: { id },
      select: { metadata: true }
    })

    if (!currentBook) {
      throw new Error("Library book not found")
    }

    if (
      currentBook.metadata &&
      typeof currentBook.metadata === "object" &&
      !Array.isArray(currentBook.metadata)
    ) {
      updatedMetadata = {
        ...currentBook.metadata,
        ...metadata
      } as Prisma.JsonObject
    } else {
      updatedMetadata = metadata as Prisma.JsonObject
    }
  }

  const data = await db.libraryBook.update({
    where: { id },
    data: {
      ...restData,
      ...(updatedMetadata && { metadata: updatedMetadata }),
      image: image?.url ? { delete: {}, create: image } : undefined
    },
    include: {
      image: true,
      owner: { include: { avatar: true, banner: true } },
      reviews: {
        include: { reviewer: { include: { avatar: true, banner: true } } }
      }
    }
  })

  return { data }
}

export async function deleteLibraryBook(id: string) {
  await db.libraryBook.delete({
    where: { id }
  })
}

// Review functions
export async function getLibraryBookReviews(
  bookId: string,
  sort: keyof LibraryBookReview = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1
) {
  const [data, meta] = await db.libraryBookReview
    .paginate({
      where: { bookId },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        reviewer: { include: { avatar: true, banner: true } },
        book: {
          include: {
            image: true,
            owner: { include: { avatar: true, banner: true } }
          }
        }
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getLibraryBookReview(reviewId: string) {
  const [data] = await db.libraryBookReview
    .paginate({
      where: { id: reviewId },
      include: {
        reviewer: { include: { avatar: true, banner: true } },
        book: {
          include: {
            image: true,
            owner: { include: { avatar: true, banner: true } }
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0] }
}

export async function createLibraryBookReview(
  bookId: string,
  reviewerName: string,
  createData: CreateLibraryBookReviewSchema
) {
  const data = await db.libraryBookReview.create({
    data: {
      ...createData,
      bookId,
      reviewerName
    },
    include: {
      reviewer: { include: { avatar: true, banner: true } },
      book: {
        include: {
          image: true,
          owner: { include: { avatar: true, banner: true } }
        }
      }
    }
  })

  return { data }
}

export async function updateLibraryBookReview(
  reviewId: string,
  updateData: UpdateLibraryBookReviewSchema
) {
  const data = await db.libraryBookReview.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      reviewer: { include: { avatar: true, banner: true } },
      book: {
        include: {
          image: true,
          owner: { include: { avatar: true, banner: true } }
        }
      }
    }
  })

  return { data }
}

export async function deleteLibraryBookReview(reviewId: string) {
  await db.libraryBookReview.delete({
    where: { id: reviewId }
  })
}

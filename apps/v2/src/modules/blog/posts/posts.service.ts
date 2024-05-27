import type { BlogPost } from "@prisma/v2-client"

import { db } from "@/utils"

import type {
  CreatePostBaseSchema,
  CreatePostSchema,
  DisplayBlogPost,
  Media
} from "./posts.schema"

export async function getPosts(
  sort: keyof BlogPost = "created",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  name: string,
  tag: string | undefined
) {
  const whereTag = tag ? { tags: { has: tag } } : {}

  const [data, meta] = await db.blogPost
    .paginate({
      where: {
        ...whereTag,
        owner: {
          equals: name
        }
      },
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        media: true,
        author: {
          include: {
            avatar: true,
            banner: true
          }
        }
      }
    })
    .withPages({
      limit: limit,
      page: page
    })

  const enrichedData = await Promise.all(
    data.map(async (post): Promise<DisplayBlogPost> => {
      let transformedMedia: Media["media"] | null = null

      if (post.media?.url) {
        transformedMedia = {
          url: post.media.url,
          alt: post.media.alt || ""
        }
      }

      return { ...post, media: transformedMedia } as DisplayBlogPost
    })
  )

  return { data: enrichedData, meta }
}

export async function getPost(id: string, name: string) {
  const [data] = await db.blogPost
    .paginate({
      where: {
        id,
        owner: {
          equals: name
        }
      },
      include: {
        media: true,
        author: {
          include: {
            avatar: true,
            banner: true
          }
        }
      }
    })
    .withPages({
      limit: 1
    })

  // Return undefined for data if no post was found, allowing for a simple truthiness check in the controller.
  if (!data.length) {
    return { data: undefined }
  }

  const post = data[0]
  let transformedMedia: Media["media"] | null = null

  if (post.media?.url) {
    transformedMedia = {
      url: post.media.url,
      alt: post.media.alt || ""
    }
  }

  return { data: { ...post, media: transformedMedia } } as {
    data: DisplayBlogPost
  }
}

export async function createPost(createPostData: CreatePostSchema) {
  const { media, ...restData } = createPostData

  const data = await db.blogPost.create({
    data: {
      ...restData,
      media: media?.url ? { create: media } : undefined
    },
    include: {
      media: true,
      author: {
        include: {
          avatar: true,
          banner: true
        }
      }
    }
  })

  return { data }
}

export async function updatePost(
  id: string,
  updatePostData: CreatePostBaseSchema
) {
  const { media, ...restData } = updatePostData

  const data = await db.blogPost.update({
    data: {
      ...restData,
      media: media?.url ? { create: media } : undefined
    },
    where: { id },
    include: {
      media: true,
      author: {
        include: {
          avatar: true,
          banner: true
        }
      }
    }
  })

  return { data }
}

export async function deletePost(id: string) {
  await db.blogPost.delete({
    where: { id }
  })
}

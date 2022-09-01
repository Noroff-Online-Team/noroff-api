import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"

export async function getPosts() {
  return prisma.post.findMany({
    include: {
      author: true,
      reactions: true
    }
  })
}

export async function getPost(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      reactions: true
    }
  })
}

export const createPost = (data: Prisma.PostUncheckedCreateInput) => {
  return prisma.post.create({ data })
}

export const updatePost = (id: number, data: Prisma.PostUpdateInput) => {
  return prisma.post.update({
    data,
    where: {
      id
    }
  })
}

export const reaction = async (postId: number, symbol: string) => {
  const match = symbol.match(/\p{Extended_Pictographic}/u)

  if (!match) {
    return {
      postId,
      symbol,
      count: 0,
      message: "Only Emoji symbols are valid reactions"
    }
  }

  const query = {
    postId_symbol: {
      postId,
      symbol
    }
  }

  let item = await prisma.reaction.findUnique({
    where: query
  })

  if (item) {
    item.count += 1
    item = await prisma.reaction.update({
      data: item,
      where: query
    })
  } else {
    item = await prisma.reaction.create({
      data: {
        postId,
        count: 1,
        symbol
      }
    })
  }

  return item
}

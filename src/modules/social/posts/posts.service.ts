import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"

export async function getPosts() {
  return prisma.post.findMany({
    include: {
      author: true
    }
  })
}

export async function getPost(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: true
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

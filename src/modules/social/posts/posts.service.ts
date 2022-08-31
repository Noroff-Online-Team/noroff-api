import { Prisma } from "@prisma/client"
import { prisma } from "../../../utils"

export async function getPosts() {
  return prisma.post.findMany()
}

export async function getPost(id: number) {
  return prisma.post.findUnique({
    where: { id }
  })
}

export const createPost = (data: Prisma.PostCreateInput) => {
  return prisma.post.create({ data })
}

export const updatePost = (id: number, data: Prisma.PostUpdateInput) =>
  prisma.post.update({
    data,
    where: {
      id
    }
  })

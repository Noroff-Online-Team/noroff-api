import { db } from "@/utils"
import type { UpdateCommentSchema } from "./comments.schema"

const commentIncludes = {
  author: { include: { avatar: true, banner: true } }
}

export async function getComment(id: string) {
  const data = await db.recipeComment.findUnique({
    where: { id },
    include: commentIncludes
  })

  return { data }
}

export async function updateComment(
  id: string,
  updateData: UpdateCommentSchema
) {
  const data = await db.recipeComment.update({
    where: { id },
    data: updateData,
    include: commentIncludes
  })

  return { data }
}

export async function deleteComment(id: string) {
  await db.recipeComment.delete({
    where: { id }
  })
}

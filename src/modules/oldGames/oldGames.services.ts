import prisma from "../../utils/prisma"
import { getRandomNumber } from "../../utils"

export async function getOldGames() {
  return prisma.oldGame.findMany()
}

export async function getOldGame(id: number) {
  return prisma.oldGame.findUnique({
    where: { id }
  })
}

export async function getRandomOldGame() {
  const resultLength = await prisma.oldGame.count()
  const id = getRandomNumber(0, resultLength)

  return prisma.oldGame.findUnique({
    where: { id }
  })
}

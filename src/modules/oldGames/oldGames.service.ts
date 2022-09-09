import { prisma, getRandomNumber } from "../../utils"

export async function getOldGames() {
  return await prisma.oldGame.findMany()
}

export async function getOldGame(id: number) {
  return await prisma.oldGame.findUnique({
    where: { id }
  })
}

export async function getRandomOldGame() {
  const resultLength = await prisma.oldGame.count()
  const id = getRandomNumber(0, resultLength)

  return await prisma.oldGame.findUnique({
    where: { id }
  })
}

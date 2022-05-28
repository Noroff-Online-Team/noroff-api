import { prisma, getRandomNumber } from "../../utils"

export async function getNbaTeams() {
  return prisma.nbaTeam.findMany()
}

export async function getNbaTeam(id: number) {
  return prisma.nbaTeam.findUnique({
    where: { id }
  })
}

export async function getRandomNbaTeam() {
  const resultLength = await prisma.nbaTeam.count()
  const id = getRandomNumber(0, resultLength)

  return prisma.nbaTeam.findUnique({
    where: { id }
  })
}

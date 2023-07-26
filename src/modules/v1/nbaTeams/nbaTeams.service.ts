import { prisma, getRandomNumber } from "@/utils"

export async function getNbaTeams() {
  return await prisma.nbaTeam.findMany()
}

export async function getNbaTeam(id: number) {
  return await prisma.nbaTeam.findUnique({
    where: { id }
  })
}

export async function getRandomNbaTeam() {
  const resultLength = await prisma.nbaTeam.count()
  const id = getRandomNumber(1, resultLength)

  return await prisma.nbaTeam.findUnique({
    where: { id }
  })
}

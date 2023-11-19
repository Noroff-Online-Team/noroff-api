import { Prisma } from "@prisma/v2-client"

import { getProfile } from "./profiles.service"

/**
 * Check is follower is following target
 * @param follower {string} - The name of follower
 * @param target {string} - The name of user to check against
 * @returns {Promise<boolean>}
 */
export async function checkIsUserFollowing(follower: string, target: string): Promise<boolean> {
  type ProfileWithFollowers = Prisma.PromiseReturnType<typeof getProfile>["data"] & {
    followers:
      | Array<{
          name: string
          avatar: string | null
        }>
      | []
  }

  const { data } = await getProfile(target, { followers: true })
  const followerProfile = data as ProfileWithFollowers | null
  const isFollowing = followerProfile?.followers.find(f => f.name === follower)

  if (!isFollowing) {
    return false
  }

  return true
}

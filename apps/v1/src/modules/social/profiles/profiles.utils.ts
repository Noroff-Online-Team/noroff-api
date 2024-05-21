import { Prisma } from "@/prisma/generated/v1-client"

import { FollowSchema } from "./profiles.schema"
import { getProfile } from "./profiles.service"

/**
 * Check is follower is following target
 * @param follower {string} - The name of follower
 * @param target {string} - The name of user to check against
 * @returns {Promise<boolean>}
 */
export async function checkIsUserFollowing(follower: string, target: string): Promise<boolean> {
  type ProfileWithFollowers = Prisma.PromiseReturnType<typeof getProfile> & { followers: Array<FollowSchema> | [] }

  const followerProfile = (await getProfile(target, { followers: true })) as ProfileWithFollowers | null
  const isFollowing = followerProfile?.followers.find(f => f.name === follower)

  if (!isFollowing) {
    return false
  }

  return true
}

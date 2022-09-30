import { Prisma, Profile } from "@prisma/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "./../../../utils/mediaGuard";
import { ProfileMediaSchema } from "./profiles.schema"

import { getProfiles, getProfile, createProfile, updateProfileMedia, followProfile, unfollowProfile } from "./profiles.service"

export interface ProfileIncludes {
  followers?: boolean;
  following?: boolean;
  posts?: boolean;
}

export async function getProfilesHandler(request: FastifyRequest<{
  Querystring: {
    limit?: number
    offset?: number
    _followers?: boolean
    _following?: boolean
    _posts?: boolean,
    sort?: keyof Profile
    sortOrder?: "asc" | "desc"
  }
}>,
reply: FastifyReply) {
  const { sort, sortOrder, limit, offset, _followers, _following, _posts } = request.query

  const includes: ProfileIncludes = {
    posts: Boolean(_posts),
    followers: Boolean(_followers),
    following: Boolean(_following)
  }

  const profiles = await getProfiles(sort, sortOrder, limit, offset, includes)
  return reply.code(200).send(profiles)
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _followers?: boolean
      _following?: boolean
      _posts?: boolean,
    }
  }>,
  reply: FastifyReply
) {
  
  const { name } = request.params
  const { _followers, _following, _posts } = request.query

  const includes: ProfileIncludes = {
    posts: Boolean(_posts),
    followers: Boolean(_followers),
    following: Boolean(_following)
  }
  
  const profile = await getProfile(name, includes)

  if (!profile) {
    const error = new Error("No profile with this name")
    return reply.code(404).send(error)
  }

  reply.code(200).send(profile)
}

export async function createProfileHandler(
  request: FastifyRequest<{
    Body: Prisma.ProfileCreateInput
  }>,
  reply: FastifyReply
) {
  const profile = await createProfile(request.body)

  await mediaGuard(profile.banner)
  await mediaGuard(profile.avatar)

  reply.code(200).send(profile);
}

export async function updateProfileMediaHandler(
  request: FastifyRequest<{
    Params: { name: string },
    Body: ProfileMediaSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { avatar, banner } = request.body;
  await mediaGuard(banner)
  await mediaGuard(avatar)
  const profile = await updateProfileMedia(name, request.body)
  reply.code(200).send(profile);
}

export async function followProfileHandler(
  request: FastifyRequest<{
    Params: { name: string },
  }>,
  reply: FastifyReply
) { 
  const { name: follower } = request.user as Profile
  const { name: target } = request.params

  if (target === follower) {
    return reply.code(400).send("You can't follow yourself")
  }

  const profile = await followProfile(target, follower)    
  reply.code(200).send(profile);  
}

export async function unfollowProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>,
  reply: FastifyReply
) {
  const { name: follower } = request.user as Profile
  const { name: target } = request.params

  if (target === follower) {
    return reply.code(400).send("You can't unfollow yourself")
  }

  const profile = await unfollowProfile(target, follower)
  reply.code(200).send(profile);
}
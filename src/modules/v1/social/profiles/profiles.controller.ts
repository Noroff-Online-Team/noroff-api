import { Profile, Post } from "@prisma-api-v1/client"
import { FastifyReply, FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import { ProfileMediaSchema } from "./profiles.schema"
import { PostIncludes } from "../posts/posts.controller"
import { NotFound, BadRequest } from "http-errors"

import {
  getProfiles,
  getProfile,
  updateProfileMedia,
  followProfile,
  unfollowProfile,
  getProfilePosts
} from "./profiles.service"
import { checkIsUserFollowing } from "./profiles.utils"

export interface ProfileIncludes {
  followers?: boolean
  following?: boolean
  posts?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      offset?: number
      _followers?: boolean
      _following?: boolean
      _posts?: boolean
      sort?: keyof Profile
      sortOrder?: "asc" | "desc"
    }
  }>,
  reply: FastifyReply
) {
  const { sort, sortOrder, limit, offset, _followers, _following, _posts } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

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
      _posts?: boolean
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
    throw new NotFound("No profile with this name")
  }

  reply.code(200).send(profile)
}

export async function updateProfileMediaHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: ProfileMediaSchema
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { avatar, banner } = request.body
  await mediaGuard(banner)
  await mediaGuard(avatar)
  const profile = await updateProfileMedia(name, request.body)
  reply.code(200).send(profile)
}

export async function followProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>,
  reply: FastifyReply
) {
  const { name: follower } = request.user as Profile
  const { name: target } = request.params

  if (target.toLowerCase() === follower.toLowerCase()) {
    throw new BadRequest("You can't follow yourself")
  }

  const profileExists = await getProfile(target)

  if (!profileExists) {
    throw new BadRequest("No profile with this name")
  }

  const isFollowing = await checkIsUserFollowing(follower, target)

  if (isFollowing) {
    throw new BadRequest("You are already following this profile")
  }

  const profile = await followProfile(target, follower)
  reply.code(200).send(profile)
}

export async function unfollowProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>,
  reply: FastifyReply
) {
  const { name: follower } = request.user as Profile
  const { name: target } = request.params

  if (target.toLowerCase() === follower.toLowerCase()) {
    throw new BadRequest("You can't unfollow yourself")
  }

  const profileExists = await getProfile(target)

  if (!profileExists) {
    throw new BadRequest("No profile with this name")
  }

  const isFollowing = await checkIsUserFollowing(follower, target)

  if (!isFollowing) {
    throw new BadRequest("You are not following this profile")
  }

  const profile = await unfollowProfile(target, follower)
  reply.code(200).send(profile)
}

export async function getProfilePostsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      offset?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      sort?: keyof Post
      sortOrder?: "asc" | "desc"
    }
  }>,
  reply: FastifyReply
) {
  const { name } = request.params
  const { sort, sortOrder, limit, offset, _author, _reactions, _comments } = request.query

  if (limit && limit > 100) {
    throw new BadRequest("Limit cannot be greater than 100")
  }

  const profileExists = await getProfile(name)

  if (!profileExists) {
    throw new NotFound("No profile with this name")
  }

  const includes: PostIncludes = {
    author: Boolean(_author),
    reactions: Boolean(_reactions),
    comments: Boolean(_comments)
  }

  const posts = await getProfilePosts(name, sort, sortOrder, limit, offset, includes)
  reply.code(200).send(posts)
}

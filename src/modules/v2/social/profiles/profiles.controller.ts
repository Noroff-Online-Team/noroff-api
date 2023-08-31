import { UserProfile, SocialPost } from "@prisma-api-v2/client"
import { FastifyRequest } from "fastify"
import { mediaGuard } from "@/utils/mediaGuard"
import { UpdateProfileSchema } from "./profiles.schema"
import { SocialPostIncludes } from "../posts/posts.controller"
import { isHttpError, NotFound, BadRequest, InternalServerError } from "http-errors"

import {
  getProfiles,
  getProfile,
  updateProfile,
  followProfile,
  unfollowProfile,
  getProfilePosts
} from "./profiles.service"
import { checkIsUserFollowing } from "./profiles.utils"
import { profilesQuerySchema, profileNameSchema, queryFlagsSchema, updateProfileSchema } from "./profiles.schema"
import { ZodError } from "zod"

export interface ProfileIncludes {
  followers?: boolean
  following?: boolean
  posts?: boolean
}

export async function getProfilesHandler(
  request: FastifyRequest<{
    Querystring: {
      limit?: number
      page?: number
      _followers?: boolean
      _following?: boolean
      _posts?: boolean
      sortOrder?: "asc" | "desc"
      sort?: keyof UserProfile
    }
  }>
) {
  try {
    await profilesQuerySchema.parseAsync(request.query)
    const { sort, sortOrder, limit, page, _followers, _following, _posts } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const includes: ProfileIncludes = {
      posts: Boolean(_posts),
      followers: Boolean(_followers),
      following: Boolean(_following)
    }

    const profiles = await getProfiles(sort, sortOrder, limit, page, includes)

    if (!profiles.data.length) {
      throw new NotFound("Couldn't find any profiles")
    }

    return profiles
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      _followers?: boolean
      _following?: boolean
      _posts?: boolean
    }
  }>
) {
  try {
    const { name } = profileNameSchema.parse(request.params)
    const { _followers, _following, _posts } = queryFlagsSchema.parse(request.query)

    const includes: ProfileIncludes = {
      posts: Boolean(_posts),
      followers: Boolean(_followers),
      following: Boolean(_following)
    }

    const profile = await getProfile(name, includes)

    if (!profile.data) {
      throw new NotFound("No profile with this name")
    }

    return profile
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function updateProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Body: UpdateProfileSchema
  }>
) {
  try {
    const { avatar, banner } = updateProfileSchema.parse(request.body)
    const { name: profileToUpdate } = profileNameSchema.parse(request.params)
    const { name: requesterProfile } = request.user as UserProfile

    if (requesterProfile.toLowerCase() !== profileToUpdate.toLowerCase()) {
      throw new BadRequest("You can't update another user's profile")
    }

    const profileExists = await getProfile(profileToUpdate)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    if (avatar?.url) {
      await mediaGuard(avatar.url)
    }
    if (banner?.url) {
      await mediaGuard(banner.url)
    }

    const profile = await updateProfile(profileToUpdate, { avatar, banner })

    return profile
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function followProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>
) {
  try {
    const { name: target } = profileNameSchema.parse(request.params)
    const { name: follower } = request.user as UserProfile

    if (target.toLowerCase() === follower.toLowerCase()) {
      throw new BadRequest("You can't follow yourself")
    }

    const profileExists = await getProfile(target)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    const isFollowing = await checkIsUserFollowing(follower, target)

    if (isFollowing) {
      throw new BadRequest("You are already following this profile")
    }

    const profile = await followProfile(target, follower)

    return profile
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function unfollowProfileHandler(
  request: FastifyRequest<{
    Params: { name: string }
  }>
) {
  try {
    const { name: target } = profileNameSchema.parse(request.params)
    const { name: follower } = request.user as UserProfile

    if (target.toLowerCase() === follower.toLowerCase()) {
      throw new BadRequest("You can't unfollow yourself")
    }

    const profileExists = await getProfile(target)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    const isFollowing = await checkIsUserFollowing(follower, target)

    if (!isFollowing) {
      throw new BadRequest("You are not following this profile")
    }

    const profile = await unfollowProfile(target, follower)

    return profile
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

export async function getProfilePostsHandler(
  request: FastifyRequest<{
    Params: { name: string }
    Querystring: {
      limit?: number
      page?: number
      _author?: boolean
      _reactions?: boolean
      _comments?: boolean
      sort?: keyof SocialPost
      sortOrder?: "asc" | "desc"
    }
  }>
) {
  try {
    await profilesQuerySchema.parseAsync(request.query)
    const { name } = profileNameSchema.parse(request.params)
    const { sort, sortOrder, limit, page, _author, _reactions, _comments } = request.query

    if (limit && limit > 100) {
      throw new BadRequest("Limit cannot be greater than 100")
    }

    const profileExists = await getProfile(name)

    if (!profileExists.data) {
      throw new NotFound("No profile with this name")
    }

    const includes: SocialPostIncludes = {
      author: Boolean(_author),
      reactions: Boolean(_reactions),
      comments: Boolean(_comments)
    }

    const posts = await getProfilePosts(name, sort, sortOrder, limit, page, includes)

    return posts
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequest(error.message)
    }

    if (isHttpError(error)) {
      throw error
    }

    throw new InternalServerError("Something went wrong.")
  }
}

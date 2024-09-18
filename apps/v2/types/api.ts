import type { UserProfile } from "@prisma/v2-client"

export type RequestUser = Pick<UserProfile, "name" | "email">

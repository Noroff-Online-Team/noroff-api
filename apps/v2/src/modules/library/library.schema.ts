import { sortAndPaginationSchema } from "@noroff/api-utils"
import { z } from "zod"

import {
  mediaProperties,
  mediaPropertiesWithErrors,
  profileCore
} from "../auth/auth.schema"

const TITLE_MIN_LENGTH = 1
const TITLE_MAX_LENGTH = 280
const DESCRIPTION_MAX_LENGTH = 2000
const AUTHOR_MAX_LENGTH = 200
const ISBN_PATTERN = /^(?:\d{9}[\dX]|\d{13})$/
const PUBLISHER_MAX_LENGTH = 200
const LANGUAGE_MAX_LENGTH = 50
const FORMAT_OPTIONS = ["Hardcover", "Paperback", "eBook", "Audiobook"] as const
const GENRES_MAX_CHAR_LENGTH = 24
const MAX_GENRES = 8
const PAGE_COUNT_MIN = 1
const PAGE_COUNT_MAX = 10000
const REVIEW_BODY_MAX_LENGTH = 280
const REVIEW_RATING_MIN = 1
const REVIEW_RATING_MAX = 5

const createdAndUpdated = {
  created: z.date(),
  updated: z.date()
}

const libraryBookId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

const libraryBookMetadata = {
  author: z
    .string({
      message: "Author must be a string"
    })
    .trim()
    .min(1, "Author cannot be empty")
    .max(
      AUTHOR_MAX_LENGTH,
      `Author cannot be greater than ${AUTHOR_MAX_LENGTH} characters`
    ),
  isbn: z
    .string({
      message: "ISBN must be a string"
    })
    .trim()
    .regex(ISBN_PATTERN, "ISBN must be a valid 10 or 13 digit ISBN")
    .optional(),
  publicationDate: z.preprocess(
    arg => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
    },
    z.date({ required_error: "Publication date is required" })
  ),
  publisher: z
    .string({
      message: "Publisher must be a string"
    })
    .trim()
    .max(
      PUBLISHER_MAX_LENGTH,
      `Publisher cannot be greater than ${PUBLISHER_MAX_LENGTH} characters`
    )
    .optional(),
  pageCount: z
    .number({
      invalid_type_error: "Page count must be a number"
    })
    .int("Page count must be an integer")
    .min(PAGE_COUNT_MIN, "Page count must be at least 1")
    .max(PAGE_COUNT_MAX, "Page count cannot exceed 10,000")
    .optional(),
  language: z
    .string({
      message: "Language must be a string"
    })
    .trim()
    .max(
      LANGUAGE_MAX_LENGTH,
      `Language cannot be greater than ${LANGUAGE_MAX_LENGTH} characters`
    )
    .default("English"),
  genres: z
    .string({
      message: "Genres must be a string"
    })
    .trim()
    .max(GENRES_MAX_CHAR_LENGTH)
    .array()
    .max(MAX_GENRES)
    .optional(),
  format: z
    .enum(FORMAT_OPTIONS, {
      message: "Format must be one of: Hardcover, Paperback, eBook, Audiobook"
    })
    .default("Paperback")
}

const libraryBookCore = {
  ...libraryBookId,
  title: z.string(),
  description: z.string(),
  image: z.object(mediaProperties).nullish(),
  metadata: z.object(libraryBookMetadata),
  owner: z.object(profileCore),
  ...createdAndUpdated
}

const libraryBookReviewId = {
  id: z
    .string({
      invalid_type_error: "ID must be a string",
      required_error: "ID is required"
    })
    .uuid({
      message: "ID must be a valid UUID"
    })
}

const libraryBookReviewCore = {
  ...libraryBookReviewId,
  comment: z
    .string({
      message: "Comment must be a string"
    })
    .trim()
    .max(
      REVIEW_BODY_MAX_LENGTH,
      "Comment cannot be greater than 280 characters"
    ),
  rating: z
    .number({
      invalid_type_error: "Rating must be a number"
    })
    .min(REVIEW_RATING_MIN, "Rating cannot be less than 1")
    .max(REVIEW_RATING_MAX, "Rating cannot be greater than 5"),
  reviewer: z.object(profileCore),
  ...createdAndUpdated
}

export const libraryBookIdSchema = z.object(libraryBookId)

export const displayLibraryBookSchema = z.object({
  ...libraryBookCore,
  reviews: z.object(libraryBookReviewCore).array().optional()
})

export const displayLibraryBookReviewSchema = z.object({
  ...libraryBookReviewCore,
  book: z.object(libraryBookCore)
})

export const createLibraryBookSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string"
    })
    .trim()
    .min(TITLE_MIN_LENGTH, "Title cannot be empty")
    .max(
      TITLE_MAX_LENGTH,
      `Title cannot be greater than ${TITLE_MAX_LENGTH} characters`
    ),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description cannot be greater than ${DESCRIPTION_MAX_LENGTH} characters`
    ),
  image: z.object(mediaPropertiesWithErrors).optional(),
  metadata: z.object({
    author: z
      .string({
        required_error: "Author is required",
        invalid_type_error: "Author must be a string"
      })
      .trim()
      .min(1, "Author cannot be empty")
      .max(
        AUTHOR_MAX_LENGTH,
        `Author cannot be greater than ${AUTHOR_MAX_LENGTH} characters`
      ),
    isbn: z
      .string({
        invalid_type_error: "ISBN must be a string"
      })
      .trim()
      .regex(ISBN_PATTERN, "ISBN must be a valid 10 or 13 digit ISBN")
      .optional(),
    publicationDate: z.preprocess(
      arg => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
      },
      z.date({ required_error: "Publication date is required" })
    ),
    publisher: z
      .string({
        invalid_type_error: "Publisher must be a string"
      })
      .trim()
      .max(
        PUBLISHER_MAX_LENGTH,
        `Publisher cannot be greater than ${PUBLISHER_MAX_LENGTH} characters`
      )
      .optional(),
    pageCount: z
      .number({
        invalid_type_error: "Page count must be a number"
      })
      .int("Page count must be an integer")
      .min(PAGE_COUNT_MIN, "Page count must be at least 1")
      .max(PAGE_COUNT_MAX, "Page count cannot exceed 10,000")
      .optional(),
    language: z
      .string({
        invalid_type_error: "Language must be a string"
      })
      .trim()
      .max(
        LANGUAGE_MAX_LENGTH,
        `Language cannot be greater than ${LANGUAGE_MAX_LENGTH} characters`
      )
      .default("English"),
    genres: z
      .string({
        invalid_type_error: "Genres must be a string"
      })
      .trim()
      .max(GENRES_MAX_CHAR_LENGTH)
      .array()
      .max(MAX_GENRES)
      .optional(),
    format: z
      .enum(FORMAT_OPTIONS, {
        message: "Format must be one of: Hardcover, Paperback, eBook, Audiobook"
      })
      .default("Paperback")
  })
})

export const createLibraryBookReviewSchema = z.object({
  comment: z
    .string({
      required_error: "Comment is required",
      invalid_type_error: "Comment must be a string"
    })
    .trim()
    .max(
      REVIEW_BODY_MAX_LENGTH,
      "Comment cannot be greater than 280 characters"
    ),
  rating: z
    .number({
      required_error: "Rating is required",
      invalid_type_error: "Rating must be a number"
    })
    .min(REVIEW_RATING_MIN, "Rating cannot be less than 1")
    .max(REVIEW_RATING_MAX, "Rating cannot be greater than 5")
})

const updateLibraryBookCore = {
  title: z
    .string({
      invalid_type_error: "Title must be a string"
    })
    .trim()
    .min(TITLE_MIN_LENGTH, "Title cannot be empty")
    .max(
      TITLE_MAX_LENGTH,
      `Title cannot be greater than ${TITLE_MAX_LENGTH} characters`
    )
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string"
    })
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description cannot be greater than ${DESCRIPTION_MAX_LENGTH} characters`
    )
    .optional(),
  image: z.object(mediaPropertiesWithErrors).optional(),
  metadata: z
    .object({
      author: z
        .string({
          invalid_type_error: "Author must be a string"
        })
        .trim()
        .min(1, "Author cannot be empty")
        .max(
          AUTHOR_MAX_LENGTH,
          `Author cannot be greater than ${AUTHOR_MAX_LENGTH} characters`
        )
        .optional(),
      isbn: z
        .string({
          invalid_type_error: "ISBN must be a string"
        })
        .trim()
        .regex(ISBN_PATTERN, "ISBN must be a valid 10 or 13 digit ISBN")
        .optional(),
      publicationDate: z
        .preprocess(
          arg => {
            if (typeof arg === "string" || arg instanceof Date)
              return new Date(arg)
          },
          z.date({
            invalid_type_error: "Publication date must be a valid date"
          })
        )
        .optional(),
      publisher: z
        .string({
          invalid_type_error: "Publisher must be a string"
        })
        .trim()
        .max(
          PUBLISHER_MAX_LENGTH,
          `Publisher cannot be greater than ${PUBLISHER_MAX_LENGTH} characters`
        )
        .optional(),
      pageCount: z
        .number({
          invalid_type_error: "Page count must be a number"
        })
        .int("Page count must be an integer")
        .min(PAGE_COUNT_MIN, "Page count must be at least 1")
        .max(PAGE_COUNT_MAX, "Page count cannot exceed 10,000")
        .optional(),
      language: z
        .string({
          invalid_type_error: "Language must be a string"
        })
        .trim()
        .max(
          LANGUAGE_MAX_LENGTH,
          `Language cannot be greater than ${LANGUAGE_MAX_LENGTH} characters`
        )
        .optional(),
      genres: z
        .string({
          invalid_type_error: "Genres must be a string"
        })
        .trim()
        .max(GENRES_MAX_CHAR_LENGTH)
        .array()
        .max(MAX_GENRES)
        .optional(),
      format: z
        .enum(FORMAT_OPTIONS, {
          message:
            "Format must be one of: Hardcover, Paperback, eBook, Audiobook"
        })
        .optional()
    })
    .optional()
}

const updateLibraryBookReviewCore = {
  comment: z
    .string({
      invalid_type_error: "Comment must be a string"
    })
    .trim()
    .max(
      REVIEW_BODY_MAX_LENGTH,
      "Comment cannot be greater than 280 characters"
    )
    .optional(),
  rating: z
    .number({
      invalid_type_error: "Rating must be a number"
    })
    .min(REVIEW_RATING_MIN, "Rating cannot be less than 1")
    .max(REVIEW_RATING_MAX, "Rating cannot be greater than 5")
    .optional()
}

export const updateLibraryBookSchema = z
  .object(updateLibraryBookCore)
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const updateLibraryBookReviewSchema = z
  .object(updateLibraryBookReviewCore)
  .refine(
    data => Object.keys(data).length > 0,
    "You must provide at least one field to update"
  )

export const libraryBookParamsSchema = z.object(libraryBookId)
export const libraryBookReviewParamsSchema = z.object({
  ...libraryBookId,
  reviewId: z
    .string({
      invalid_type_error: "Review ID must be a string"
    })
    .uuid({
      message: "Review ID must be a valid UUID"
    })
})

export const libraryBooksQuerySchema = sortAndPaginationSchema

export type DisplayLibraryBookSchema = z.infer<typeof displayLibraryBookSchema>
export type CreateLibraryBookSchema = z.infer<typeof createLibraryBookSchema>
export type UpdateLibraryBookSchema = z.infer<typeof updateLibraryBookSchema>
export type DisplayLibraryBookReviewSchema = z.infer<
  typeof displayLibraryBookReviewSchema
>
export type CreateLibraryBookReviewSchema = z.infer<
  typeof createLibraryBookReviewSchema
>
export type UpdateLibraryBookReviewSchema = z.infer<
  typeof updateLibraryBookReviewSchema
>

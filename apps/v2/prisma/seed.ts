import { faker } from "@faker-js/faker"
import type { UserProfile } from "@prisma/v2-client"

import { createListing, createListingBid } from "../src/modules/auction/listings/listings.service"
import { createProfile } from "../src/modules/auth/auth.service"
import { createBooking } from "../src/modules/holidaze/bookings/booking.service"
import { createVenue } from "../src/modules/holidaze/venues/venues.service"
import { createComment, createOrDeleteReaction, createPost } from "../src/modules/social/posts/posts.service"
import { db } from "../src/utils"

// Run the seed function and exit when done
main()
  .catch(async e => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
    process.exit(0)
  })

function getRandomArrayElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomSocialPostTitle() {
  const socialTitles = [
    () => `${faker.hacker.verb()} ${faker.hacker.noun()}`,
    () => `${faker.color.human()} ${faker.commerce.productMaterial()}`,
    () => `The Art of ${faker.commerce.productAdjective()}`,
    () => `My ${faker.date.month()} ${faker.hacker.adjective()} Diary`,
    () => `Adventures in ${faker.location.country()}`,
    () => `${faker.hacker.ingverb()} in the Age of ${faker.commerce.product()}`,
    () => `${faker.commerce.productName()}: A ${faker.hacker.adjective()} Tale`
  ]

  return getRandomArrayElement(socialTitles)()
}

function getRandomSocialPostBody() {
  const socialPosts = [
    () => faker.lorem.sentence(),
    () => `What's everyone's favorite ${faker.commerce.product()}? Looking for recommendations!`,
    () =>
      `Just started a new job as a ${faker.person.jobTitle()} at ${faker.company.name()}. Excited for this new chapter!`,
    () =>
      `Had a great time visiting ${faker.location.city()}! The ${faker.commerce.productMaterial()} landscapes were breathtaking. 🌄`,
    () => `Just watched ${faker.lorem.words(2)} on ${faker.company.name()}. Highly recommend! 🎥`,
    () => `Why do ${faker.animal.cat()}s always ${faker.lorem.words(3)}? Just a thought.`
  ]

  return getRandomArrayElement(socialPosts)()
}

function getRandomSocialPostTags() {
  const tagSources = [
    faker.hacker.noun,
    faker.commerce.productAdjective,
    faker.company.buzzNoun,
    faker.commerce.department,
    faker.music.genre
  ]

  const tags: string[] = []

  for (let i = 0; i < 3; i++) {
    const randomTagSource = getRandomArrayElement(tagSources)
    tags.push(randomTagSource())
  }

  return [...new Set(tags)]
}

async function createSampleSocialPost(userOne: UserProfile, userTwo: UserProfile) {
  // Create post
  const { data: post } = await createPost({
    title: getRandomSocialPostTitle(),
    body: getRandomSocialPostBody(),
    tags: getRandomSocialPostTags(),
    media: {
      url: faker.image.url(),
      alt: faker.lorem.sentence()
    },
    owner: userOne.name
  })

  // Add reactions to post
  await createOrDeleteReaction(post.id, "😂", userTwo.name)
  await createOrDeleteReaction(post.id, "😎", userTwo.name)

  // Create comment
  const { data: postComment } = await createComment(post.id, userTwo.name, { body: "Haha, good one!" })
  // Reply to comment
  await createComment(post.id, userOne.name, { body: "Thanks, glad you liked it!", replyToId: postComment.id })
}

async function createSampleAuctionListings(userOne: UserProfile, userTwo: UserProfile) {
  // Create listing
  const { data: listing } = await createListing(
    {
      title: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      media: [
        {
          url: `${faker.image.url()}`,
          alt: faker.lorem.sentence()
        },
        {
          url: `${faker.image.url()}`,
          alt: faker.lorem.sentence()
        }
      ],
      endsAt: faker.date.future()
    },
    userOne.name
  )

  // Add bid to listing
  await createListingBid(listing.id, userTwo.name, 10)
}

function getRandomVenueContinent() {
  const continents = ["Africa", "Antarctica", "Asia", "Europe", "North America", "Australia", "South America"]
  return getRandomArrayElement(continents)
}

async function createSampleHolidazeData(userOne: UserProfile, userTwo: UserProfile) {
  // Create venue
  const { data: venue } = await createVenue(userOne.name, {
    name: `${faker.word.adjective()} ${faker.commerce.productMaterial()}`,
    description: faker.lorem.sentence(),
    media: [
      {
        url: `${faker.image.url()}`,
        alt: faker.lorem.sentence()
      },
      {
        url: `${faker.image.url()}`,
        alt: faker.lorem.sentence()
      }
    ],
    price: faker.number.float({ min: 100, max: 1000 }),
    maxGuests: faker.number.int({ min: 2, max: 10 }),
    rating: faker.number.float({ min: 0.5, max: 5, precision: 0.5 }),
    meta: {
      wifi: faker.datatype.boolean(),
      breakfast: faker.datatype.boolean(),
      parking: faker.datatype.boolean(),
      pets: faker.datatype.boolean()
    },
    location: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
      continent: getRandomVenueContinent(),
      lat: faker.location.latitude(),
      lng: faker.location.longitude()
    }
  })

  // Create booking for venue
  await createBooking({
    venueId: venue.id,
    guests: faker.number.int({ min: 1, max: venue.maxGuests }),
    dateFrom: new Date(),
    dateTo: faker.date.soon({ days: 4 }),
    customerName: userTwo.name
  })
}

async function createUser() {
  const name = faker.person.firstName()
  const email = faker.internet.email({ firstName: name, provider: "stud.noroff.no" })

  // Create user
  const { data: user } = await createProfile({ name, email, password: "keyboardcat" })
  return user as UserProfile
}

// Main seed function
async function main() {
  /* USER PROFILE */
  const userOne = await createUser()
  const userTwo = await createUser()

  /* SOCIAL */
  await createSampleSocialPost(userOne, userTwo)

  /* AUCTION HOUSE */
  await createSampleAuctionListings(userOne, userTwo)

  /* HOLIDAZE */
  await createSampleHolidazeData(userOne, userTwo)
}

# Noroff API v2 SDK

A TypeScript SDK for interacting with the Noroff API v2. This SDK provides type-safe, easy-to-use methods for accessing all Noroff API endpoints.

## Features

- 🔒 **Type Safety**: Full TypeScript support with Zod runtime validation
- 🎯 **Smart Autocomplete**: Type-safe query parameters with IntelliSense for sortable fields
- 🚀 **Easy to Use**: Simple, intuitive API design
- 📦 **Modular**: Organized by feature modules (books, social, auction, etc.)
- 🔄 **Automatic Retries**: Built-in retry logic with exponential backoff
- 🛡️ **Error Handling**: Comprehensive error handling with custom error types
- 📊 **Pagination**: Built-in support for pagination and sorting

## Installation

```bash
# Using npm
npm install @noroff/sdk

# Using pnpm
pnpm add @noroff/sdk

# Using yarn
yarn add @noroff/sdk
```

## Quick Start

```typescript
import { NoroffSDK } from '@noroff/sdk'

// Initialize the SDK
const client = new NoroffSDK({
  apiKey: 'your-api-key', // Optional for some endpoints
  baseURL: 'https://v2.api.noroff.dev' // Optional, defaults to v2 API
})

// Get all books
const books = await client.books.getAll({ limit: 10 })

// Get a specific book
const book = await client.books.getById(1)

// Get a random book
const randomBook = await client.books.getRandom()
```

## Configuration

```typescript
interface SDKConfig {
  baseURL?: string        // API base URL (default: https://v2.api.noroff.dev)
  apiKey?: string         // Your API key
  accessToken?: string    // Bearer token for authentication
  timeout?: number        // Request timeout in ms (default: 30000)
  retries?: number        // Number of retries (default: 3)
  headers?: Record<string, string> // Additional headers
}
```

## Modules

### Books Module

```typescript
// Get all books with pagination and type-safe sorting
const books = await client.books.getAll({
  limit: 20,
  page: 1,
  sort: 'title',        // ✓ IntelliSense shows: id, title, author, genre, etc.
  sortOrder: 'asc'      // ✓ IntelliSense shows: asc, desc
})

// Get a specific book by ID
const book = await client.books.getById(123)

// Get a random book
const randomBook = await client.books.getRandom()

// Type-safe sorting examples
const byAuthor = await client.books.getAll({ sort: 'author', sortOrder: 'desc' })
const byGenre = await client.books.getAll({ sort: 'genre' })
const byPublished = await client.books.getAll({ sort: 'published' })

// ❌ These will show TypeScript errors:
// const invalid = await client.books.getAll({ sort: 'invalid_field' })  // Error!
// const badOrder = await client.books.getAll({ sortOrder: 'random' })   // Error!
```

## Enhanced Type Safety Features

The SDK provides world-class type safety with specific response types and smart parameter validation:

```typescript
import type { SortableBookField, SortOrder } from '@noroff/sdk'

// Available sortable fields (auto-completed by IntelliSense)
type BookFields = SortableBookField  // "id" | "title" | "author" | "genre" | "description" | "isbn" | "published" | "publisher"

// Sort orders (auto-completed by IntelliSense)
type Orders = SortOrder  // "asc" | "desc"

// Type-safe function parameters
const getSortedBooks = async (field: SortableBookField, order: SortOrder = 'asc') => {
  return client.books.getAll({ sort: field, sortOrder: order })
}

// ✅ Valid calls (with autocomplete support)
await getSortedBooks('title', 'desc')
await getSortedBooks('author')

// ❌ Invalid calls (TypeScript errors)
// await getSortedBooks('invalid')     // Error: not assignable to SortableBookField
// await getSortedBooks('title', 'up') // Error: not assignable to SortOrder
```

### Specific Response Types

The SDK uses precise response types for maximum type safety:

```typescript
import type { BooksArrayResponse, SingleBookResponse } from '@noroff/sdk'

// getAll() always returns BooksArrayResponse - data is guaranteed to be Book[]
const booksResponse: BooksArrayResponse = await client.books.getAll()
console.log(booksResponse.data.length)        // ✅ No type guards needed!
console.log(booksResponse.data[0].title)      // ✅ Direct array access!

// getById() and getRandom() return SingleBookResponse - data is guaranteed to be Book
const bookResponse: SingleBookResponse = await client.books.getById(1)
console.log(bookResponse.data.title)          // ✅ Direct property access!

// No more union types like Book[] | {} | Book[][] - just clean, specific types!
```

### Single Source of Truth Architecture

The SDK uses Zod schemas as the single source of truth for both TypeScript types and runtime validation:

```typescript
import { booksArrayResponseSchema, singleBookResponseSchema } from '@noroff/sdk'

// Schema defines the structure once
const schema = booksArrayResponseSchema
// TypeScript types are automatically inferred from the schema
type Response = z.infer<typeof schema>
// Runtime validation uses the same schema
const validatedData = schema.parse(apiResponse)

// Benefits:
// ✅ Change schema once, types update everywhere
// ✅ Guaranteed consistency between types and validation
// ✅ No manual type synchronization needed
// ✅ Impossible for types to drift from reality
```

## Error Handling

The SDK provides comprehensive error handling:

```typescript
import { APIError } from '@noroff/sdk'

try {
  const book = await client.books.getById(999)
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}): ${error.message}`)
    console.error('Error details:', error.data)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Types

The SDK exports all TypeScript types for better development experience:

```typescript
import type {
  Book,
  BooksQueryParams,
  SortableBookField,
  SortOrder,
  APIResponse,
  SDKConfig
} from '@noroff/sdk'

// Fully typed book objects
const handleBooks = (books: Book[]) => {
  books.forEach(book => {
    console.log(book.title, book.author, book.isbn)
  })
}

// Type-safe sorting function
const sortBooks = (field: SortableBookField, order: SortOrder) => {
  return client.books.getAll({ sort: field, sortOrder: order })
}

// Available types for reference
type ValidSortFields = SortableBookField  // "id" | "title" | "author" | "genre" | "description" | "isbn" | "published" | "publisher"
type ValidSortOrders = SortOrder          // "asc" | "desc"
```

## Runtime Validation

All API responses are validated using Zod schemas:

```typescript
import { bookSchema } from '@noroff/sdk'

// Validate a book object
const validatedBook = bookSchema.parse(bookData)
```

## Advanced Usage

### Custom HTTP Client Access

```typescript
// Get the underlying HTTP client for advanced usage
const httpClient = client.getHttpClient()

// Make custom requests
const customResponse = await httpClient.get('/custom-endpoint')
```

### Authentication Management

```typescript
// Set API key
client.setApiKey('new-api-key')

// Set access token
client.setAccessToken('bearer-token')

// Remove credentials
client.removeApiKey()
client.removeAccessToken()
```

## Development

```bash
# Install dependencies
pnpm install

# Run development example
pnpm dev

# Build the SDK
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Roadmap

This is a proof-of-concept implementation focusing on the Books module. Planned expansions:

- [ ] **Auth Module**: Login, register, API key management
- [ ] **Social Module**: Posts, profiles, comments, reactions
- [ ] **Auction Module**: Listings, bidding, profiles
- [ ] **Holidaze Module**: Venues, bookings, profiles
- [ ] **Blog Module**: Posts and content management
- [ ] **Additional Modules**: Pets, artworks, library, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the terms specified by Noroff School of Technology and Digital Media.

## Support

For issues and questions:
- Create an issue in the repository
- Contact Noroff support

---

Built with ❤️ for the Noroff developer community
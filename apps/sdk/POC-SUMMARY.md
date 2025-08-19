# Noroff API v2 SDK - Proof of Concept

## Overview

This is a proof-of-concept implementation of a TypeScript SDK for the Noroff API, specifically focusing on the Books module.

## What Was Accomplished

### ✅ Core SDK Architecture
- **Main SDK Client** (`NoroffSDK`) - Entry point with module organization
- **HTTP Client** (`HTTPClient`) - Robust request handling with retries, error handling, and authentication
- **Type-Safe Design** - Full TypeScript support with Zod schema validation
- **Modular Structure** - Organized by API modules for scalability

### ✅ Books Module Implementation
- `getAll()` - Fetch all books with pagination and sorting
- `getRandom()` - Get a random book
- `getById(id)` - Get a specific book by ID
- Runtime validation using Zod schemas
- Comprehensive error handling

### ✅ Key Features Implemented
1. **Authentication Support**
   - API key authentication (`X-Noroff-API-Key`)
   - Bearer token authentication (`Authorization`)
   - Dynamic credential management

2. **Error Handling**
   - Custom `APIError` class with status codes and error data
   - Automatic retry logic with exponential backoff
   - Comprehensive error messages

3. **Enhanced Type Safety**
   - Full TypeScript types exported
   - Runtime validation with Zod
   - **Type-safe query parameters** with `keyof Book` for sorting
   - IntelliSense autocomplete for sortable fields (`SortableBookField`)
   - Compile-time validation for sort orders (`"asc" | "desc"`)
   - **Specific response types**: `BooksArrayResponse` and `SingleBookResponse`
   - **No type guards needed** - TypeScript knows exact return types
   - Matches v2 API type patterns exactly

4. **Developer Experience**
   - Simple, intuitive API design
   - **Smart autocomplete** for all parameters
   - Comprehensive documentation
   - Working example code
   - Type safety demonstration files

## File Structure

```
apps/sdk/
├── src/
│   ├── types/
│   │   ├── api.ts          # Core API types and interfaces
│   │   └── books.ts        # Books-specific types and schemas
│   ├── utils/
│   │   └── http-client.ts  # HTTP client with retry logic
│   ├── modules/
│   │   └── books.ts        # Books module implementation
│   ├── client.ts               # Main SDK client class
│   ├── index.ts                # Public exports
│   ├── demo.ts                 # Working demo
│   └── type-safety-example.ts  # Type safety demonstrations
├── README.md                   # Full documentation
├── TYPE-SAFETY-DEMO.md         # Type safety feature guide
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsup.config.ts         # Build configuration
└── vitest.config.ts       # Test configuration
```

## Usage Example

```typescript
import { NoroffSDK } from '@noroff/sdk'

// Initialize
const client = new NoroffSDK({
  baseURL: 'https://v2.api.noroff.dev',
  apiKey: 'your-api-key'
})

// Use with enhanced type safety and autocomplete
const books = await client.books.getAll({
  limit: 10,
  sort: 'title',        // ✓ IntelliSense shows valid Book fields
  sortOrder: 'asc'      // ✓ IntelliSense shows "asc" | "desc"
})

const book = await client.books.getById(1)
const randomBook = await client.books.getRandom()

// Type-safe sorting - these will show TypeScript errors:
// const invalid = await client.books.getAll({ sort: 'invalid_field' })  // ❌ Error
// const badOrder = await client.books.getAll({ sortOrder: 'random' })   // ❌ Error

// ✅ Enhanced: TypeScript knows exact return types - no type guards needed!
console.log(books.data.length)         // ✓ Always works - data is guaranteed Book[]
console.log(book.data.title)           // ✓ Always works - data is guaranteed Book
console.log(randomBook.data.author)    // ✓ Always works - data is guaranteed Book
```

## Technical Highlights

### 1. Robust HTTP Client
- Automatic retries with exponential backoff
- Timeout handling with AbortSignal
- Proper error parsing and custom error types
- Support for all HTTP methods

### 2. Type-Safe API Responses
```typescript
interface APIResponse<T> {
  data: T
  meta: {
    currentPage?: number
    totalCount?: number
    pageCount?: number
    isFirstPage?: boolean
    isLastPage?: boolean
    previousPage?: number | null
    nextPage?: number | null
  }
}
```

### 3. Runtime Validation
- All API responses validated with Zod schemas
- Catches API changes at runtime
- Ensures data integrity

### 4. Extensible Architecture
- Easy to add new modules (social, auction, holidaze, etc.)
- Consistent patterns across all modules
- Shared utilities and types

## Build and Test Results

- ✅ **Build**: Successfully compiles to both CommonJS and ESM
- ✅ **Types**: All TypeScript types compile without errors
- ✅ **Demo**: Working initialization and basic functionality
- ✅ **Structure**: Follows project conventions and best practices

## Next Steps for Full Implementation

1. **Add Remaining Modules**:
   - Auth module (login, register, API keys)
   - Social module (posts, profiles, comments)
   - Auction module (listings, bidding)
   - Holidaze module (venues, bookings)
   - Blog, pets, artworks, library modules

2. **Enhanced Features**:
   - OpenAPI spec generation integration
   - Mock server for testing
   - Request/response interceptors
   - Caching strategies

3. **Developer Tools**:
   - CLI tool for SDK generation
   - Documentation site integration
   - Interactive examples
# V3

Work in progress.

## Running the API

From root you can specify the app with `-F v3...` flag. We append `...` to limit the scope to a package and its dependencies.

```bash
pnpm dev -F v3...
```

## Known issues

- Swagger UI is not functional due to the use of `zod-prisma-types` generator.
  - This can likely be solved by upgrading Zod to v4, Prisma to v6 and using `prisma-zod-generator` instead of `zod-prisma-types`.
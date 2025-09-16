# Noroff API v2

## Running the API

From root you can specify the app with `-F v2...` flag

```bash
pnpm dev -F v2...
```

### Running tests

To run tests you can use the following command.

```bash
pnpm test:dev
```

This will spin up a docker container with a postgres database, apply migrations and run the jest tests against it.
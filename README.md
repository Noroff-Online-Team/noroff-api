# Noroff API

This repository contains the source code for the Noroff API. It is a monorepo setup with Turborepo.

## Apps

- [docs](apps/docs): Documentation for the API.
- [v1](apps/v1): Version 1 of the API.
- [v2](apps/v2): Version 2 of the API.

## Shared Packages

- [api-utils](packages/api-utils): Utilities for the API.
- [logger](packages/logger): Logger for the API.

## Getting Started

This project uses pnpm as the package manager.

Run install from the root of the project.

```bash
pnpm install
```

### Running the API

Run the API with the following command.

To run all apps (v1, v2, docs) you can use the following command.

```bash
pnpm dev
```

To run a specific app you can use the following command. We append `...` to limit the scope to a package and its dependencies.

Replace `v2` with the app you want to run. I.e. `v1`, `v2`, `docs`.

```bash
pnpm dev -F v2...
```
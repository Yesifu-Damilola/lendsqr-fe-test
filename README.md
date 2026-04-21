This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Data Layer Structure

The app now uses a scalable data architecture with clear separation of concerns:

- `src/api/`: Axios client and API request functions.
- `src/query/`: custom React Query hooks.
- `src/queryOptions/`: reusable query configuration objects.
- `src/types/`: shared domain types used across UI and data layers.

### Mock APIs (Mocky.io / JSON Generator)

1. Generate user payloads with [JSON Generator](https://www.json-generator.com/).
2. Paste the generated JSON in [Mocky.io](https://designer.mocky.io/) and publish.
3. Copy `.env.example` to `.env.local`.
4. Set:
   - `NEXT_PUBLIC_MOCK_API_BASE_URL` (for Mocky this is usually `https://run.mocky.io/v3/`)
   - `NEXT_PUBLIC_LOGIN_URL` (optional full URL override for login, e.g. `https://mocki.io/v1/<uuid>`)
   - `NEXT_PUBLIC_USERS_URL` (optional full URL override for users list endpoint)
   - `NEXT_PUBLIC_USER_DETAILS_URL` (optional endpoint template override, supports `{id}` or `:id`)

The app will call these routes relative to that base URL (unless `NEXT_PUBLIC_LOGIN_URL` is set):

- `login`
- `user`
- `userdetails/{id}`

The users list query, user detail query, and login mutation use Axios + async/await + TanStack Query and are intended to read from your mock API endpoints.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

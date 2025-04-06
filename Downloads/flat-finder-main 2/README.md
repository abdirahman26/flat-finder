This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

# Commit Message Convention Guide

To ensure consistency and clarity in our commit history, we follow the **Conventional Commits** standard. Below is the list of commit types and their purposes:

| Type        | Purpose                                                  | Example                             |
| ----------- | -------------------------------------------------------- | ----------------------------------- |
| `feat:`     | A new feature added to the codebase                      | `feat: add user signup form`        |
| `fix:`      | A bug fix that addresses an issue                        | `fix: resolve navbar alignment bug` |
| `chore:`    | Routine tasks, project setup, and non-functional updates | `chore: install eslint`             |
| `refactor:` | Code improvements that don't add functionality           | `refactor: clean up API calls`      |
| `docs:`     | Documentation updates (README, comments, etc.)           | `docs: update project setup guide`  |
| `style:`    | Changes related to code formatting (Prettier, etc.)      | `style: apply prettier formatting`  |

## Additional Notes:

- **`chore:`**: Used for updates or maintenance tasks that don't affect the app’s functionality (e.g., installing dependencies, updating config files, or folder structure changes).
- **`feat:`** and **`fix:`** should be used when adding new features or fixing bugs that impact the functionality of the app.
- **`refactor:`** is reserved for changes to the codebase that do not affect functionality but improve structure or readability.
- **`docs:`** applies only to changes in documentation files (e.g., updating the README).
- **`style:`** is for changes that don't affect the logic of the code, such as formatting or minor code style tweaks.

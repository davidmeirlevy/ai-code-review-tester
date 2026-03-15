# AI Code Review Tester

A demo application designed to test and evaluate AI-powered code review platforms. The codebase intentionally contains a mix of good code patterns and subtle issues that code review tools should be able to identify and discuss.

## Project Structure

```
ai-code-review-tester/
├── backend/          # NestJS REST API
├── frontend/         # Next.js application
└── README.md
```

## Running the Project

```bash
# Install all dependencies
npm run install:all

# Start backend (port 3001)
npm run dev:backend

# Start frontend (port 3000)
npm run dev:frontend
```

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT Authentication
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: PostgreSQL (configure in backend `.env`)

---

## Intentional Issues (For Code Review Testing)

This repository contains deliberately introduced bugs, security vulnerabilities, and code smells. These are documented here for reference — a good AI code review tool should identify them from code inspection alone.

### Backend Issues

#### 1. Hardcoded JWT Secret (`backend/src/auth/auth.service.ts`)
```typescript
const secret = 'mysecret123';
```
The JWT signing secret is hardcoded in source code. This should be read from an environment variable (`process.env.JWT_SECRET`) and never committed to version control.

#### 2. No Password Hashing (`backend/src/auth/auth.service.ts`)
In the `validateUser` method, passwords are compared in plain text. There is no `bcrypt` or equivalent hashing. If the database is compromised, all user passwords are exposed immediately.

#### 3. Missing Input Validation on DTOs (`backend/src/users/dto/update-user.dto.ts`)
Some fields in the update DTO are missing `@IsString()`, `@IsEmail()`, or `@IsOptional()` decorators. This means invalid data can reach the service layer without validation errors.

#### 4. N+1 Query Pattern (`backend/src/orders/orders.service.ts`)
In `getOrdersByUser`, the code fetches a list of orders and then loops through each order to fetch associated products in separate queries. This results in N+1 database queries and will cause performance degradation at scale.

#### 5. Missing try/catch in Async Controllers (`backend/src/products/products.controller.ts`)
Several async controller methods do not have try/catch blocks or use NestJS exception filters properly. Unhandled promise rejections can crash the Node.js process in some configurations.

---

### Frontend Issues

#### 1. Password Stored in localStorage (`frontend/src/app/auth/login/page.tsx`)
```typescript
localStorage.setItem('token', password);
```
The user's **password** (not the auth token) is accidentally being stored in localStorage. This is a critical security vulnerability exposing user credentials in plain text.

#### 2. Missing `key` Prop in List Render (`frontend/src/app/products/page.tsx`)
A `.map()` call renders product category badges without a `key` prop, causing React reconciliation warnings and potential rendering bugs.

#### 3. `useEffect` with Missing Dependency Array (`frontend/src/app/dashboard/page.tsx`)
A `useEffect` hook is missing its dependency array, causing it to run after every render and creating an infinite re-render loop when it triggers a state update.

#### 4. `dangerouslySetInnerHTML` with User Input (`frontend/src/app/products/[id]/page.tsx`)
A product description field rendered with `dangerouslySetInnerHTML` passes user-supplied content without sanitization, creating a stored XSS vulnerability.

#### 5. Large Monolithic Component (`frontend/src/app/users/page.tsx`)
The users admin page is a 200+ line component that handles data fetching, table rendering, modal state, form state, and business logic all in one place. It should be broken into smaller, focused components.

---

## Notes for Code Review Tools

The issues above vary in severity:
- **Critical**: Hardcoded secrets, password storage vulnerability, XSS via dangerouslySetInnerHTML
- **High**: No password hashing, N+1 queries
- **Medium**: Missing validation, missing error handling
- **Low/Style**: Large components, missing key props, prop drilling patterns

A high-quality code review tool should:
1. Identify the security issues and explain *why* they are dangerous
2. Suggest concrete fixes (not just flag the issue)
3. Understand context (e.g., distinguish the N+1 pattern from intentional separate queries)
4. Rate severity appropriately
5. Not produce excessive false positives on the intentionally good code patterns

# Cursor BugBot Configuration

This file provides context for Cursor BugBot to review pull requests in this repository.

## Project Overview

**ShopDash** is a full-stack e-commerce platform used internally to evaluate AI code review tools.
It consists of a NestJS REST API backend and a Next.js 14 frontend.

```
ai-code-review-tester/
├── backend/   # NestJS + TypeORM + PostgreSQL
└── frontend/  # Next.js 14 App Router + Tailwind CSS
```

## Architecture

### Backend (`/backend`)
- **Framework**: NestJS 10, TypeScript
- **ORM**: TypeORM with PostgreSQL
- **Auth**: JWT via `@nestjs/jwt` + Passport strategies
- **Modules**: `auth`, `users`, `products`, `orders`
- **API prefix**: `/api`
- **Port**: 3001

### Frontend (`/frontend`)
- **Framework**: Next.js 14 App Router, TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context (AuthContext, CartContext)
- **HTTP client**: Axios with request/response interceptors
- **Port**: 3000

## What BugBot Should Focus On

### Security
- Hardcoded secrets or credentials anywhere in the codebase
- Missing input validation on DTOs and API endpoints
- Authentication/authorization gaps (unprotected routes, missing guards)
- Insecure data storage (localStorage misuse, plaintext sensitive data)
- XSS vectors — especially `dangerouslySetInnerHTML` without sanitization
- SQL injection risks in query construction

### Backend (NestJS) Patterns
- Missing `@IsString()`, `@IsEmail()`, `@IsNotEmpty()` decorators on DTOs
- Unhandled promise rejections in async controller/service methods
- N+1 database query patterns (nested loops that trigger repeated DB calls)
- Missing database transactions for multi-step writes
- Passwords stored or compared without hashing (bcrypt)
- JWT secrets not sourced from environment variables

### Frontend (React/Next.js) Patterns
- Missing `key` props in `.map()` renders
- `useEffect` hooks with missing or incorrect dependency arrays
- Direct DOM manipulation (`document.getElementById`) instead of refs
- Oversized components (>150 lines) that should be decomposed
- Sensitive data (tokens, passwords) stored in `localStorage`
- User-controlled content passed to `dangerouslySetInnerHTML`

### General
- Missing error handling in async functions
- Race conditions in concurrent operations
- Console logs or debug code left in production paths
- Unused imports or dead code

## Coding Conventions

- TypeScript strict mode is enabled — avoid `any`
- All API responses follow `PaginatedResponse<T>` shape for lists
- Backend validation uses `class-validator` decorators on DTOs
- Frontend API calls go through `src/lib/api.ts` (never fetch directly)
- Environment variables: backend uses `process.env.*`, frontend uses `NEXT_PUBLIC_*`

## Out of Scope

- Test files (`*.spec.ts`, `*.test.ts`)
- Auto-generated migration files
- `node_modules/`, `dist/`, `.next/`

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Baleryon 2.0** is a fashion e-commerce platform built with Next.js 16, React 19, and TypeScript. It follows a modern Indian streetwear aesthetic inspired by The Souled Store and Wrogn, combining playful, youthful energy with premium, minimal design principles.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint (reports issues, does not auto-fix)
```

## Architecture & Structure

### Directory Layout
- `src/app/` — Next.js 16 App Router (pages, layouts, global styles)
- `src/components/` — React components organized by domain
  - `ui/` — Reusable UI primitives from shadcn/ui
- `src/lib/` — Utility functions and helpers

### Technology Stack
- **Framework**: Next.js 16.2.6 with App Router (breaking changes — see below)
- **UI & Styling**:
  - Tailwind CSS 4 (via `@tailwindcss/postcss`)
  - shadcn/ui components (via `shadcn` package)
  - Radix UI primitives underlying shadcn
  - CVA (class-variance-authority) for component variants
- **Animations**: Motion 12.40.0
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge for class composition

### Styling System
- CSS in `src/app/globals.css` uses Tailwind 4's `@import` and `@layer` directives
- Custom theme variables configured via CSS custom properties (oklch color space)
- Design tokens defined in `@theme inline` block and `:root` + `.dark` rules
- Supports light and dark modes via `.dark` class

### Path Aliases
The project uses TypeScript path alias `@/*` → `./src/*` for absolute imports.

## Next.js 16 Critical Notes

**⚠️ Breaking Changes** — This version of Next.js has breaking changes that differ from standard Next.js versions. Before writing code:

1. **Consult the official guide** in `node_modules/next/dist/docs/` for APIs, conventions, and file structure
2. **Check deprecation warnings** — many patterns from earlier versions are no longer valid
3. **Next.js 16 App Router specifics** — file naming, route conventions, and patterns may differ from your training data

Common areas affected: middleware conventions, API route structure, server/client component boundaries, and caching behavior.

## Component Development

- Add new UI components to `src/components/ui/` if they're reusable primitives
- Domain-specific components go in `src/components/` (organized by feature)
- Use shadcn/ui as the base for styled components; customize via Tailwind and CVA
- Follow the design system defined in `fashion_ecommerce_design_system_md.md` for typography scales, color palette, and layout grid

## Type Safety

- `tsconfig.json` has `strict: true` — strict type checking is required
- Ensure all React components have proper TypeScript prop types
- Use `type` keyword for type-only imports to optimize bundle size

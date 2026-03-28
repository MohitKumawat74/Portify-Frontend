**Project Summary**

This document describes the frontend application structure, user flows, UI primitives, and all major pages in the repository. It focuses on the current flow and UI surface for public, admin, and user dashboards, plus supporting services/components/hooks/stores and template flows.

**Overview**
- **Framework**: Next.js (App Router) with TypeScript. Files live under `src/app` with grouped routes for public, admin, and user dashboards.
- **Main UI stack**: React + Tailwind (global styles in `src/styles/globals.css`), component-driven design in `src/components`.
- **State & data**: lightweight stores under `src/store` for auth, portfolio, and toast; services under `src/services` for API calls.

**Primary Flows**
- **Public browsing flow**: Visitor lands on public homepage, browses templates, pricing, blog, docs, and can register or login.
- **Auth flow**: Login/Register actions go through `authService` and `authStore`/`authStore.ts` or `authStore` equivalents; authenticated users are routed to the appropriate dashboard based on role.
- **User dashboard flow**: Authenticated users access `user-dashboard` routes to manage their portfolio, templates, and account settings.
- **Admin flow**: Admins access `admin-dashboard` routes to manage users, templates, themes, portfolios and view analytics.
- **Portfolio/template flow**: Users pick or create a template, edit data (portfolioService), and render via `templates/TemplateRenderer.tsx`.

**Routing & Pages (high-level)**
- **Public pages (src/app/(public))**: public landing and marketing pages.
  - Home: [src/app/(public)/page.tsx](src/app/%28public%29/page.tsx#L1)
  - About, Blog, Careers, Changelog, Contact, Cookies, Features, Login, Portfolio showcase, Pricing, Privacy, Register, Templates, Terms — each exists as a directory under `src/app/(public)` (see `src/app/(public)` folder).
- **Admin dashboard (src/app/(admin-dashboard)/admin)**: admin area with sub-areas.
  - Admin landing: [src/app/(admin-dashboard)/admin/page.tsx](src/app/%28admin-dashboard%29/admin/page.tsx#L1) (entry for admin)
  - Subsections: `analytics/`, `portfolios/`, `templates/`, `themes/`, `users/` — each hosts list/detail/manage UI for the corresponding resource.
- **User dashboard (src/app/(user-dashboard)/dashboard)**: user-facing dashboard routes to manage personal portfolio(s).

**Key Components (src/components)**
- **Layout & Shell**: `layout/Container.tsx`, `layout/Navbar.tsx`, `layout/Footer.tsx`, `layout/Sidebar.tsx` — top-level layout primitives used across public and dashboard pages.
- **Dashboard UI**: `dashboard/DashboardLayout.tsx`, `dashboard/AdminSidebar.tsx`, `dashboard/DashboardSidebar.tsx`, `dashboard/TopNavbar.tsx`, `dashboard/StatCard.tsx`, `dashboard/DashboardCard.tsx`.
- **UI primitives**: `ui/Button.tsx`, `ui/Input.tsx`, `ui/Card.tsx`, `ui/Modal.tsx`, `ui/Badge.tsx`, `ui/Loader.tsx`, `ui/CountUp.tsx`.
- **Motion & effects**: `motion/*` (AnimatedSection, PageTransition, ParallaxSection, LenisProvider, etc.) and `effects/ParticlesBackground.tsx` for visuals.
- **3D Scenes**: `components/3d/HeroScene.tsx`, `components/3d/SkillsScene.tsx` used in hero/landing sections.

**Templates & Rendering**
- **Templates folder**: `src/templates` contains `Template1`, `Template2`, `Template3` and a `TemplateRenderer.tsx` that wires data to template components for live rendering and preview.
- **Template flow**: user selects a template, `templateService` pulls base data, user edits fields stored in `portfolioStore`, and the `TemplateRenderer` composes the final page.

**Services & API**
- **API wrapper**: `src/services/api.ts` centralizes HTTP setup (base URLs, interceptors, auth headers).
- **Domain services**: `authService.ts`, `userService.ts`, `portfolioService.ts`, `templateService.ts`, `planService.ts`, `contactService.ts`, `adminService.ts` — each provides API methods used by pages and hooks.

**State & Hooks**
- **Stores**: `src/store/authStore.ts`, `src/store/portfolioStore.ts`, `src/store/toastStore.ts` handle auth state, portfolio editing state, and global toasts.
- **Custom hooks**: `useAuth.ts` (auth helpers + guard), `usePortfolio.ts` (portfolio CRUD helpers), `useTheme.ts`, `useScrollAnimation.ts`, `useParallaxAnimation.ts`, `useStaggerAnimation.ts`, `useHoverAnimation.ts` — used across pages for UX behavior.

**Notable Pages & Responsibilities**
- **Public Homepage**: hero, features, templates preview, call-to-action to register/login. (See [src/app/(public)/page.tsx](src/app/%28public%29/page.tsx#L1)).
- **Login/Register**: authentication pages connecting to `authService` and updating `authStore`.
- **Portfolio pages**: templates listing and single portfolio previews; preview and share routes available under `src/app/(public)/portfolio`.
- **Admin panels**: CRUD for templates, themes and portfolios; user management and analytics dashboards.
- **User dashboard**: portfolio creation/editing, manage plans/subscriptions, and settings.

**UI Patterns & Conventions**
- **Component-first**: small, reusable UI primitives in `components/ui`, larger composed components in `components/*`.
- **Motion-first UX**: heavy use of `components/motion` and `components/effects` for polished transitions and parallax.
- **Template-driven**: templates are self-contained React components and rendered through `TemplateRenderer` for preview and publish.

**Where to look first (important files)**
- `src/app/(public)/page.tsx` — public landing page entry.
- `src/app/(admin-dashboard)/admin` — admin dashboard entry and subsections.
- `src/app/(user-dashboard)/dashboard` — user dashboard entry.
- `src/templates/TemplateRenderer.tsx` — compose portfolio templates.
- `src/services` — API surface and domain services.
- `src/store` — client-side state management.

**Developer notes & next steps**
- **Auth edge cases**: ensure social login persists both `isLoggedIn` and `userRole` before navigation to prevent bounce-back into guards.
- **Templates**: confirm `TemplateRenderer` handles missing fields and has fallbacks for production rendering.
- **Accessibility**: audit interactive components (modals, buttons) for keyboard focus and ARIA attributes.

If you want, I can:
- Expand this into a per-page checklist with file-level links and responsibilities.
- Generate a diagram of the routing and data flows.
- Produce a brief contributor guide describing how to add a new template or admin page.

---
Generated summary for quick onboarding and roadmap work.

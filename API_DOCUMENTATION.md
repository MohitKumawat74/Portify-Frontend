# Portify — Backend API Documentation

> **Base URL:** `http://localhost:5000/api`  
> **Content-Type:** `application/json`  
> **Authentication:** Bearer Token (`Authorization: Bearer <token>`)  
> All protected routes require the `Authorization` header unless marked **Public**.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Portfolios](#3-portfolios)
4. [Templates](#4-templates)
5. [Pricing / Plans](#5-pricing--plans)
6. [Admin — Analytics](#6-admin--analytics)
7. [Admin — Themes](#7-admin--themes)
8. [Contact](#8-contact)
9. [Common Response Shapes](#9-common-response-shapes)
10. [Error Codes](#10-error-codes)

---

## 1. Auth

### `POST /auth/register` — Public

Register a new user.

**Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass@123"
}
```

**Success Response** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null,
      "createdAt": "2026-03-09T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

**Validation Errors** `422 Unprocessable Entity`
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email already in use" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

### `POST /auth/login` — Public

Authenticate an existing user.

**Request Body**
```json
{
  "email": "jane@example.com",
  "password": "StrongPass@123"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_abc123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": "https://cdn.portify.dev/avatars/usr_abc123.png",
      "createdAt": "2026-03-09T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

**Error Response** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### `POST /auth/logout` — Protected

Invalidate the current token (token blacklisting / refresh token revocation).

**Request Body**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### `POST /auth/refresh` — Public

Obtain a new access token using the refresh token.

**Request Body**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `GET /auth/profile` — Protected

Get the currently authenticated user's profile.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "id": "usr_abc123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatar": "https://cdn.portify.dev/avatars/usr_abc123.png",
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `POST /auth/forgot-password` — Public

Send a password reset email.

**Request Body**
```json
{
  "email": "jane@example.com"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": null
}
```

---

### `POST /auth/reset-password` — Public

Reset password using the token from the email link.

**Request Body**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewStrongPass@456"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

---

## 2. Users

### `GET /users` — Admin Only

Get a paginated list of all users.

**Query Params**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Search by name or email |
| `role` | string | — | Filter by `user` or `admin` |

**Success Response** `200 OK`
```json
{
  "data": [
    {
      "id": "usr_abc123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "avatar": null,
      "createdAt": "2026-03-09T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

---

### `GET /users/:id` — Admin Only

Get a specific user by ID.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "User fetched",
  "data": {
    "id": "usr_abc123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "avatar": null,
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `PUT /users/:id` — Protected (self or admin)

Update user profile information.

**Request Body** _(all fields optional)_
```json
{
  "name": "Jane Smith",
  "avatar": "https://cdn.portify.dev/avatars/updated.png"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "id": "usr_abc123",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "avatar": "https://cdn.portify.dev/avatars/updated.png",
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `PATCH /users/:id/role` — Admin Only

Change a user's role.

**Request Body**
```json
{
  "role": "admin"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": "usr_abc123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin",
    "avatar": null,
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `DELETE /users/:id` — Admin Only

Permanently delete a user and all their portfolios.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "User deleted",
  "data": null
}
```

---

### `PUT /users/:id/password` — Protected (self only)

Change the logged-in user's password.

**Request Body**
```json
{
  "currentPassword": "StrongPass@123",
  "newPassword": "NewStrongPass@456"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

### `POST /users/:id/avatar` — Protected (self only)

Upload a new avatar image. Use `multipart/form-data`.

**Request** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `avatar` | File | Image file (JPEG/PNG, max 2 MB) |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Avatar uploaded",
  "data": {
    "avatarUrl": "https://cdn.portify.dev/avatars/usr_abc123.png"
  }
}
```

---

## 3. Portfolios

### `GET /portfolios` — Protected

Get all portfolios belonging to the authenticated user.

**Query Params**
| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 10 |

**Success Response** `200 OK`
```json
{
  "data": [
    {
      "id": "pf_xyz789",
      "userId": "usr_abc123",
      "title": "My Developer Portfolio",
      "slug": "jane-doe",
      "templateId": "template1",
      "theme": {
        "primaryColor": "#6366f1",
        "secondaryColor": "#8b5cf6",
        "backgroundColor": "#ffffff",
        "textColor": "#111827",
        "fontFamily": "Inter, sans-serif"
      },
      "sections": [],
      "isPublished": false,
      "createdAt": "2026-03-09T10:00:00.000Z",
      "updatedAt": "2026-03-09T10:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### `POST /portfolios` — Protected

Create a new portfolio.

**Request Body**
```json
{
  "title": "My Developer Portfolio",
  "templateId": "template1",
  "theme": {
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "backgroundColor": "#ffffff",
    "textColor": "#111827",
    "fontFamily": "Inter, sans-serif"
  }
}
```

**Success Response** `201 Created`
```json
{
  "success": true,
  "message": "Portfolio created",
  "data": {
    "id": "pf_xyz789",
    "userId": "usr_abc123",
    "title": "My Developer Portfolio",
    "slug": "jane-doe",
    "templateId": "template1",
    "theme": { "primaryColor": "#6366f1", "secondaryColor": "#8b5cf6", "backgroundColor": "#ffffff", "textColor": "#111827", "fontFamily": "Inter, sans-serif" },
    "sections": [],
    "isPublished": false,
    "createdAt": "2026-03-09T10:00:00.000Z",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `GET /portfolios/:id` — Protected

Get a single portfolio by ID (owner or admin only).

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Portfolio fetched",
  "data": {
    "id": "pf_xyz789",
    "userId": "usr_abc123",
    "title": "My Developer Portfolio",
    "slug": "jane-doe",
    "templateId": "template1",
    "theme": {
      "primaryColor": "#6366f1",
      "secondaryColor": "#8b5cf6",
      "backgroundColor": "#ffffff",
      "textColor": "#111827",
      "fontFamily": "Inter, sans-serif"
    },
    "sections": [
      {
        "id": "sec_001",
        "type": "hero",
        "order": 1,
        "data": {
          "name": "Jane Doe",
          "headline": "Full Stack Developer",
          "bio": "I build things for the web.",
          "avatarUrl": "https://cdn.portify.dev/avatars/usr_abc123.png",
          "ctaLabel": "View my work",
          "ctaHref": "#projects"
        }
      },
      {
        "id": "sec_002",
        "type": "about",
        "order": 2,
        "data": {
          "heading": "About Me",
          "body": "Passionate developer with 5 years of experience.",
          "location": "San Francisco, CA",
          "availableForWork": true
        }
      },
      {
        "id": "sec_003",
        "type": "skills",
        "order": 3,
        "data": {
          "skills": [
            { "id": "sk_01", "name": "React", "level": 90, "category": "Frontend" },
            { "id": "sk_02", "name": "Node.js", "level": 80, "category": "Backend" }
          ]
        }
      },
      {
        "id": "sec_004",
        "type": "projects",
        "order": 4,
        "data": {
          "projects": [
            {
              "id": "pr_01",
              "title": "Awesome App",
              "description": "A full-stack SaaS application.",
              "techStack": ["Next.js", "Prisma", "PostgreSQL"],
              "liveUrl": "https://awesome-app.dev",
              "repoUrl": "https://github.com/jane/awesome-app",
              "image": "https://cdn.portify.dev/projects/pr_01.png"
            }
          ]
        }
      },
      {
        "id": "sec_005",
        "type": "experience",
        "order": 5,
        "data": {
          "experiences": [
            {
              "id": "exp_01",
              "company": "TechCorp",
              "role": "Senior Developer",
              "startDate": "2022-01-01",
              "endDate": null,
              "isCurrent": true,
              "description": "Led frontend architecture for core product."
            }
          ]
        }
      },
      {
        "id": "sec_006",
        "type": "contact",
        "order": 6,
        "data": {
          "email": "jane@example.com",
          "linkedinUrl": "https://linkedin.com/in/janedoe",
          "githubUrl": "https://github.com/janedoe",
          "twitterUrl": "https://twitter.com/janedoe",
          "message": "Open to new opportunities."
        }
      }
    ],
    "isPublished": true,
    "createdAt": "2026-03-09T10:00:00.000Z",
    "updatedAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `GET /portfolios/public/:slug` — Public

Fetch a published portfolio by its slug (for public viewing).

**Success Response** `200 OK` — same shape as `GET /portfolios/:id`

**Error** `404 Not Found` — portfolio does not exist or is not published

---

### `PUT /portfolios/:id` — Protected

Update a portfolio's content, theme, or sections.

**Request Body** _(all fields optional)_
```json
{
  "title": "Updated Portfolio Title",
  "templateId": "template2",
  "theme": {
    "primaryColor": "#10b981"
  },
  "sections": [
    {
      "id": "sec_001",
      "type": "hero",
      "order": 1,
      "data": {
        "name": "Jane Doe",
        "headline": "Frontend Architect"
      }
    }
  ]
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Portfolio updated",
  "data": { "...updated portfolio object..." }
}
```

---

### `DELETE /portfolios/:id` — Protected

Delete a portfolio permanently.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Portfolio deleted",
  "data": null
}
```

---

### `PATCH /portfolios/:id/publish` — Protected

Publish a portfolio (make it publicly accessible).

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Portfolio published",
  "data": {
    "id": "pf_xyz789",
    "isPublished": true,
    "slug": "jane-doe",
    "updatedAt": "2026-03-09T10:05:00.000Z"
  }
}
```

---

### `PATCH /portfolios/:id/unpublish` — Protected

Unpublish a portfolio (make it private).

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Portfolio unpublished",
  "data": {
    "id": "pf_xyz789",
    "isPublished": false,
    "updatedAt": "2026-03-09T10:06:00.000Z"
  }
}
```

---

### `GET /portfolios/:id/analytics` — Protected

Get view analytics for a specific portfolio.

**Query Params**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | ISO date | 30 days ago | Start of date range |
| `to` | ISO date | now | End of date range |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Analytics fetched",
  "data": {
    "portfolioId": "pf_xyz789",
    "totalViews": 1240,
    "uniqueVisitors": 830,
    "avgTimeOnPage": 94,
    "topCountries": [
      { "country": "United States", "views": 430 },
      { "country": "India", "views": 210 }
    ],
    "viewsByDay": [
      { "date": "2026-03-01", "views": 45 },
      { "date": "2026-03-02", "views": 62 }
    ]
  }
}
```

---

## 4. Templates

### `GET /templates` — Public

Get all active templates (paginated).

**Query Params**
| Param | Type | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 10 |

**Success Response** `200 OK`
```json
{
  "data": [
    {
      "id": "template1",
      "name": "Minimal Dark",
      "description": "Clean, minimal dark-mode portfolio with smooth animations.",
      "thumbnail": "https://cdn.portify.dev/thumbnails/template1.png",
      "category": "minimal",
      "isPremium": false,
      "isActive": true,
      "createdAt": "2026-01-10T00:00:00.000Z"
    },
    {
      "id": "template2",
      "name": "3D Showcase",
      "description": "Immersive portfolio with Three.js 3D elements.",
      "thumbnail": "https://cdn.portify.dev/thumbnails/template2.png",
      "category": "creative",
      "isPremium": true,
      "isActive": true,
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### `GET /templates/:id` — Public

Get a single template by ID.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Template fetched",
  "data": {
    "id": "template1",
    "name": "Minimal Dark",
    "description": "Clean, minimal dark-mode portfolio with smooth animations.",
    "thumbnail": "https://cdn.portify.dev/thumbnails/template1.png",
    "category": "minimal",
    "isPremium": false,
    "isActive": true,
    "createdAt": "2026-01-10T00:00:00.000Z"
  }
}
```

---

### `POST /templates` — Admin Only

Create a new template.

**Request Body**
```json
{
  "name": "Aurora",
  "description": "A vibrant gradient-based portfolio template.",
  "thumbnail": "https://cdn.portify.dev/thumbnails/aurora.png",
  "category": "creative",
  "isPremium": true,
  "isActive": true
}
```

**Success Response** `201 Created`
```json
{
  "success": true,
  "message": "Template created",
  "data": {
    "id": "template4",
    "name": "Aurora",
    "description": "A vibrant gradient-based portfolio template.",
    "thumbnail": "https://cdn.portify.dev/thumbnails/aurora.png",
    "category": "creative",
    "isPremium": true,
    "isActive": true,
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### `PUT /templates/:id` — Admin Only

Update an existing template.

**Request Body** _(all fields optional)_
```json
{
  "name": "Aurora v2",
  "isPremium": false
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Template updated",
  "data": { "...updated template object..." }
}
```

---

### `PATCH /templates/:id/toggle` — Admin Only

Toggle a template's active status.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Template status toggled",
  "data": {
    "id": "template1",
    "isActive": false
  }
}
```

---

### `DELETE /templates/:id` — Admin Only

Delete a template.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Template deleted",
  "data": null
}
```

---

## 5. Pricing / Plans

### `GET /plans` — Public

Get all available pricing plans.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Plans fetched",
  "data": [
    {
      "id": "plan_free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "billingPeriod": "forever",
      "description": "Everything you need to get started and get noticed.",
      "features": [
        "3 portfolio templates",
        "Custom slug URL",
        "5 projects showcase",
        "Skills section",
        "Mobile responsive",
        "Basic analytics"
      ],
      "isPopular": false,
      "isActive": true
    },
    {
      "id": "plan_pro",
      "name": "Pro",
      "price": 9,
      "currency": "USD",
      "billingPeriod": "month",
      "description": "For serious developers who want every edge.",
      "features": [
        "All 50+ premium templates",
        "Custom domain (coming soon)",
        "Unlimited projects",
        "3D skill visualisations",
        "Advanced analytics",
        "Priority support",
        "SEO optimisation",
        "PDF export",
        "Remove branding"
      ],
      "isPopular": true,
      "isActive": true
    },
    {
      "id": "plan_team",
      "name": "Team",
      "price": 29,
      "currency": "USD",
      "billingPeriod": "month",
      "description": "For agencies and teams managing multiple portfolios.",
      "features": [
        "Everything in Pro",
        "Up to 10 team members",
        "Team analytics dashboard",
        "Dedicated support",
        "Custom branding"
      ],
      "isPopular": false,
      "isActive": true
    }
  ]
}
```

---

### `POST /subscriptions/checkout` — Protected

Initiate a checkout session for a paid plan (Stripe integration).

**Request Body**
```json
{
  "planId": "plan_pro",
  "successUrl": "https://app.portify.dev/dashboard?upgrade=success",
  "cancelUrl": "https://app.portify.dev/pricing"
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Checkout session created",
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_live_..."
  }
}
```

---

### `GET /subscriptions/current` — Protected

Get the current user's active subscription.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Subscription fetched",
  "data": {
    "id": "sub_stripe123",
    "planId": "plan_pro",
    "planName": "Pro",
    "status": "active",
    "currentPeriodStart": "2026-02-09T00:00:00.000Z",
    "currentPeriodEnd": "2026-03-09T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

### `POST /subscriptions/cancel` — Protected

Cancel the current subscription at the end of the billing period.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Subscription will be cancelled at end of billing period",
  "data": {
    "cancelAtPeriodEnd": true,
    "currentPeriodEnd": "2026-03-09T00:00:00.000Z"
  }
}
```

---

## 6. Admin — Analytics

### `GET /admin/analytics` — Admin Only

Get platform-wide analytics overview.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Analytics fetched",
  "data": {
    "totalUsers": 10432,
    "totalPortfolios": 24870,
    "totalTemplates": 3,
    "activePortfolios": 18540,
    "recentSignups": 183,
    "topTemplates": [
      { "templateId": "template1", "name": "Minimal Dark", "count": 9820 },
      { "templateId": "template2", "name": "3D Showcase", "count": 8150 },
      { "templateId": "template3", "name": "Classic Light", "count": 6900 }
    ],
    "revenueThisMonth": 14399,
    "revenueLastMonth": 12870,
    "signupsByDay": [
      { "date": "2026-03-01", "signups": 42 },
      { "date": "2026-03-02", "signups": 38 }
    ]
  }
}
```

---

### `GET /admin/analytics/users` — Admin Only

Get user growth and activity stats.

**Query Params**
| Param | Type | Default |
|-------|------|---------|
| `from` | ISO date | 30 days ago |
| `to` | ISO date | now |

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "User analytics fetched",
  "data": {
    "newUsers": 183,
    "activeUsers": 4210,
    "churnedUsers": 31,
    "retentionRate": 82.5,
    "usersByPlan": {
      "free": 8900,
      "pro": 1320,
      "team": 212
    }
  }
}
```

---

## 7. Admin — Themes

### `GET /admin/themes` — Admin Only

Get all global themes configured on the platform.

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Themes fetched",
  "data": [
    {
      "id": "theme_dark",
      "name": "Dark Default",
      "primaryColor": "#6366f1",
      "secondaryColor": "#8b5cf6",
      "backgroundColor": "#0a0a0f",
      "textColor": "#f9fafb",
      "fontFamily": "Inter, sans-serif",
      "isDefault": true
    },
    {
      "id": "theme_light",
      "name": "Light Clean",
      "primaryColor": "#6366f1",
      "secondaryColor": "#8b5cf6",
      "backgroundColor": "#ffffff",
      "textColor": "#111827",
      "fontFamily": "Inter, sans-serif",
      "isDefault": false
    }
  ]
}
```

---

### `POST /admin/themes` — Admin Only

Create a new global theme.

**Request Body**
```json
{
  "name": "Ocean Blue",
  "primaryColor": "#0ea5e9",
  "secondaryColor": "#38bdf8",
  "backgroundColor": "#0c1a2e",
  "textColor": "#e0f2fe",
  "fontFamily": "Fira Code, monospace"
}
```

**Success Response** `201 Created`
```json
{
  "success": true,
  "message": "Theme created",
  "data": {
    "id": "theme_ocean",
    "name": "Ocean Blue",
    "primaryColor": "#0ea5e9",
    "secondaryColor": "#38bdf8",
    "backgroundColor": "#0c1a2e",
    "textColor": "#e0f2fe",
    "fontFamily": "Fira Code, monospace",
    "isDefault": false
  }
}
```

---

### `PUT /admin/themes/:id` — Admin Only

Update an existing theme.

**Request Body** _(all fields optional)_
```json
{
  "primaryColor": "#7c3aed",
  "isDefault": true
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Theme updated",
  "data": { "...updated theme object..." }
}
```

---

### `DELETE /admin/themes/:id` — Admin Only

Delete a theme (cannot delete the default theme).

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Theme deleted",
  "data": null
}
```

---

## 8. Contact

### `POST /contact` — Public

Send a message via the contact form.

**Request Body**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "Hi, I'd love to discuss a potential partnership..."
}
```

**Success Response** `200 OK`
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": null
}
```

---

## 9. Common Response Shapes

### Single Resource

```json
{
  "success": true,
  "message": "Human-readable status",
  "data": { "...resource object..." }
}
```

### Paginated List

```json
{
  "data": [ "...array of items..." ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Email already in use" }
  ]
}
```

---

## 10. Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — malformed body or missing required fields |
| `401` | Unauthorized — missing or invalid Bearer token |
| `403` | Forbidden — authenticated but insufficient permissions |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — e.g., email already registered |
| `422` | Unprocessable Entity — validation errors |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error |

---

## Rate Limiting

| Route Group | Limit |
|-------------|-------|
| Auth (login/register) | 10 req / 15 min per IP |
| Public APIs | 100 req / min per IP |
| Protected APIs | 300 req / min per token |
| Admin APIs | 500 req / min per token |

---

## Authentication Flow

```
1. User calls POST /auth/register or POST /auth/login
2. Server returns { token, refreshToken }
3. Client stores token in memory, refreshToken in httpOnly cookie (recommended)
4. Client sends Authorization: Bearer <token> on every protected request
5. When token expires (401), client calls POST /auth/refresh with refreshToken
6. Server returns new { token }
7. On logout, client calls POST /auth/logout to revoke refreshToken
```

---

*Last updated: March 9, 2026*

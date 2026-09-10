# SyntaxHub — Phase 9 Security

## Implemented
- Course and Problem Solving detail APIs require a valid authenticated JWT.
- Public course listing exposes metadata only; course content is not included.
- Authenticated search index endpoint protects topic/subtopic/problem content from unauthenticated API access.
- Frontend protects course details, Problem Solving pages, Problem Details, and Search with ProtectedRoute.
- Admin APIs remain protected by requireAuth + requireAdmin.
- CORS uses an explicit allow-list from `CLIENT_URL` (comma-separated values supported).
- Security response headers added: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Express `x-powered-by` disabled.
- JSON request body limited to 100 KB.
- Lightweight API rate limiting added, with stricter limits for authentication endpoints.
- JWT secret is required and must be at least 32 characters.
- JWT expiry/issued-at validation strengthened.
- Login/register password length is capped at 128 characters.
- Mongoose update operations use `returnDocument: "after"`.
- Login redirect preserves the original protected URL query string.

## Content access rule
Unauthenticated users may see the public course catalogue/card metadata, but cannot fetch or render course lesson content, Problem Solving content, or search content. They are redirected to Login when opening protected content routes.

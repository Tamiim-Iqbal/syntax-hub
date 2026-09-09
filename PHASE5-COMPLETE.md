# SyntaxHub — Phase 5 Complete

## Admin Dashboard

Phase 5 adds:
- Admin-only route and backend authorization.
- Admin overview statistics.
- User list and role management.
- Course list.
- Course create/edit/delete controls for course metadata and content JSON.
- Publish/draft status.
- Admin navigation link.
- Public course APIs expose published courses only.

## Make a user admin

From the `backend` directory:

```bash
npm run make-admin -- your-email@example.com
```

Then log out and log in again so the new role is loaded into the JWT/session.

## Run

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev:backend
```

# SyntaxHub

SyntaxHub is a React + TypeScript programming-learning platform backed by an Express + MongoDB API.

## Project structure

- `src/` — React/Vite frontend
- `backend/src/` — Express/Mongoose backend
- `backend/src/data/courses.ts` — seed content

## Setup

### 1. Frontend

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5050/api
```

Then:

```bash
npm install
npm run dev
```

### 2. Backend

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5050
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/syntaxhub?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Then:

```bash
cd backend
npm install
npm run seed
npm run dev
```

The seed command inserts the course content from `backend/src/data/courses.ts` into MongoDB.

## Validation

From the project root:

```bash
npm run lint
npm run build
npm run build:backend
```

## Notes

- `.env` files are intentionally excluded from the project archive.
- `node_modules`, build output, Vite cache, and local editor files are excluded.
- The frontend API URL is configurable through `VITE_API_URL`.
- Backend CORS is configurable through `CLIENT_URL`.

## Phase 1 update

This build includes the Phase 1 polish pass:

- Route-level lazy loading with React `Suspense` to reduce the initial JavaScript payload.
- Highlight.js highlighting memoized so code is not re-highlighted on unrelated renders.
- Common JavaScript/TypeScript/Python/C++/C# aliases for code highlighting.
- Mobile layout polish down to very small screens.
- Horizontal overflow protection on the document.
- Improved copy-code accessibility labels.
- Problem solution tabs now use full available width on small screens.
- Existing loading, error, empty-state, dark-mode, and API configuration are preserved.

Before running, install dependencies in both the root and `backend` directories.

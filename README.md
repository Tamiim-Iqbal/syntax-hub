# SyntaxHub 🚀

> **Learn programming concepts once. Understand them across languages.**

SyntaxHub is a modern programming-learning platform designed around a simple problem: **beginners often have to relearn the same programming concept every time they switch languages.**

Variables, functions, loops, conditionals, data structures, and other fundamentals are concepts—not separate ideas for every programming language. SyntaxHub separates the **concept** from its **syntax**, helping learners understand the underlying idea first and then see how that idea is expressed in different languages.

The platform is built with a React + TypeScript frontend and an Express + MongoDB backend, with authentication, protected course content, multi-language courses, problem-solving content, search, and an admin dashboard.

---

## 🎯 Why SyntaxHub?

Learning multiple programming languages can become repetitive.

For example, a learner who already understands **variables in C++** shouldn't have to learn the entire concept of variables again before seeing how variables are written in JavaScript or Python.

SyntaxHub is designed to make that transition easier:

```text
             Programming Concept
                    │
          ┌─────────┴─────────┐
          │                   │
       Understand           Practice
          │                   │
          ▼                   ▼
   Concept explanation   Problem Solving
          │
          ▼
   Language-specific syntax
   ┌──────┬──────┬──────┬──────┐
   │ C++  │ JS   │ Python │ C# │ ...
   └──────┴──────┴────────┴────┘
```

The goal is to make programming education **less repetitive, more concept-focused, and easier to navigate**.

---

## ✨ Core Features

### 📚 Multi-language Learning

- Learn a programming concept without unnecessary repetition.
- Switch between supported programming languages.
- View language-specific code examples for the same concept.
- Designed to support languages such as JavaScript, Python, C++, C#, and more.

### 💻 Single-language Courses

Traditional course structures are also supported for learners who want to follow a focused language-specific path.

### 🧠 Problem Solving

A dedicated problem-solving section organizes programming challenges into categories and individual problems, including:

- Problem statement
- Examples
- Approach/explanation
- Solution
- Problem navigation

### 🔐 Authentication

SyntaxHub includes account-based access to learning content.

- Email/password registration and login
- Google authentication
- JWT-based authentication
- Protected routes for authenticated users
- Role-based admin access
- Secure password hashing using PBKDF2

### 👨‍💻 Admin Dashboard

Administrators can manage the learning platform without changing frontend code.

- View platform overview
- View users
- Manage user roles
- Create courses
- Update courses
- Delete courses
- Manage course content
- Access image upload authentication for content management

### 🔎 Search

Authenticated users can access a searchable course index to quickly find relevant learning content.

### 🎨 User Experience

- Responsive design
- Light / dark theme
- English / Bangla interface support
- Mobile-friendly layouts
- Loading skeletons
- Error states
- Empty states
- Code syntax highlighting
- Copy-code functionality
- Client-side routing
- Route-level lazy loading

### 🛡️ Backend Security & Reliability

The API includes several defensive measures:

- Security response headers
- API rate limiting
- Stricter rate limits for authentication endpoints
- Authentication middleware
- Admin authorization middleware
- Request validation for course operations
- Centralized error handling
- Protected course/search content
- Public preview endpoints that avoid exposing full lesson content

---

## 🧰 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI development |
| **TypeScript** | Type-safe application development |
| **Vite** | Frontend tooling and build system |
| **React Router** | Client-side routing |
| **Highlight.js** | Code syntax highlighting |
| **CSS** | Responsive UI and component styling |
| **Google OAuth** | Google sign-in integration |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express 5** | REST API framework |
| **TypeScript** | Type-safe backend development |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM |
| **Google Auth Library** | Google credential verification |
| **JWT** | Authentication/session tokens |
| **PBKDF2 + SHA-512** | Password hashing |
| **dotenv** | Environment configuration |

### Development & Deployment

- ESLint
- TypeScript compiler
- Vite production builds
- Vercel-ready frontend configuration
- Render-ready backend configuration
- Environment-based API configuration
- Smoke-test script for basic QA

---

## 🏗️ Architecture

SyntaxHub follows a separated frontend/backend architecture:

```text
┌───────────────────────────────────────────────┐
│                   Frontend                    │
│             React + TypeScript + Vite        │
│                                               │
│  Pages → Components → Services → API          │
└───────────────────────┬───────────────────────┘
                        │ HTTP / REST API
                        ▼
┌───────────────────────────────────────────────┐
│                    Backend                    │
│              Node.js + Express + TS           │
│                                               │
│ Routes → Controllers → Services → Models      │
│                    │                          │
│              Middleware                       │
│        Auth • Admin • Security • Errors       │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   MongoDB   │
                 └─────────────┘
```

### Frontend structure

```text
src/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
├── assets/
├── App.tsx
├── main.tsx
└── index.css
```

### Backend structure

```text
backend/src/
├── config/
├── controllers/
├── data/
├── middleware/
├── models/
├── routes/
├── services/
├── types/
├── validators/
├── app.ts
├── server.ts
└── seed.ts
```

The backend uses a layered structure so routing, business logic, database models, validation, and middleware remain separated and easier to maintain.

---

## 🔐 Authentication Flow

```text
User
 │
 ├── Register / Login
 │
 └── Google Sign-in
        │
        ▼
     Express API
        │
        ├── Validate credentials
        ├── Verify Google token
        ├── Check user
        └── Generate JWT
                │
                ▼
             Frontend
                │
                ▼
       Protected API Requests
```

Full course content and authenticated search data are protected by backend authentication middleware.

Admin endpoints additionally require the user to have an `admin` role.

---

## 📖 Course Content Model

SyntaxHub supports two major course patterns:

### Single-language course

```text
Course
 └── Topics
      ├── Topic 1
      ├── Topic 2
      ├── Topic 3
      └── ...
```

### Multi-language course

```text
Course
 └── Languages
      ├── JavaScript
      │    ├── Topic 1
      │    ├── Topic 2
      │    └── ...
      │
      ├── Python
      │    ├── Topic 1
      │    ├── Topic 2
      │    └── ...
      │
      └── C++
           ├── Topic 1
           ├── Topic 2
           └── ...
```

This structure allows the platform to reuse the same learning concept while presenting language-specific syntax and examples.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js `>= 24 < 27`
- npm
- MongoDB / MongoDB Atlas
- Google OAuth credentials if Google login is enabled

### 1. Clone the repository

```bash
git clone <your-private-repository-url>
cd syntaxhub
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create the frontend `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:5050/api
```

Create `backend/.env` from `backend/.env.example` and configure your database/authentication values:

```env
PORT=5050
MONGODB_URI=your-mongodb-connection-string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
```

> **Never commit real secrets or `.env` files to GitHub.**

### 5. Seed the database

```bash
cd backend
npm run seed
```

### 6. Start the backend

```bash
npm run dev
```

### 7. Start the frontend

Open another terminal from the project root:

```bash
npm run dev
```

The frontend and backend can now run together locally.

---

## 🧪 Available Scripts

### Root / Frontend

```bash
npm run dev          # Start Vite development server
npm run build        # Build frontend
npm run build:all    # Build frontend + backend
npm run build:backend # Build backend
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run qa:smoke     # Run smoke checks
npm run check        # Smoke test + lint + frontend build
```

### Backend

```bash
npm run dev          # Start backend in watch mode
npm run build        # Compile backend TypeScript
npm start            # Start compiled backend
npm run seed         # Seed course data
npm run make-admin   # Promote a user to admin
```

---

## 🌍 Deployment

The application is structured for separate frontend and backend deployment.

```text
GitHub
  │
  ├──────────────► Vercel
  │                  │
  │                  └── React/Vite Frontend
  │
  └──────────────► Backend hosting
                     │
                     └── Express API
                              │
                              ▼
                           MongoDB
```

The frontend API endpoint is configurable through `VITE_API_URL`, while backend CORS is controlled through `CLIENT_URL`.

---

## 📈 Engineering Highlights

SyntaxHub is more than a static course website. The project demonstrates several practical full-stack engineering concepts:

- Component-based React architecture
- TypeScript across frontend and backend
- RESTful API design
- MongoDB data modeling with Mongoose
- Authentication and authorization
- Role-based access control
- Google OAuth integration
- Secure password hashing
- Protected API routes
- Backend validation
- API rate limiting
- Security headers
- Centralized error handling
- Search indexing
- Dynamic database-driven course content
- Admin content management
- Responsive UI architecture
- Loading/error/empty states
- Lazy-loaded routes
- Production build and deployment configuration

---

## 🗺️ Project Vision

SyntaxHub is being built with a larger vision: create a programming-learning environment where learners can focus on **understanding programming**, rather than repeatedly memorizing the same concept in different languages.

Future directions may include:

- Progress tracking
- Bookmarks and saved topics
- More programming languages
- More problem-solving categories
- Interactive coding practice
- Personalized learning paths
- Richer analytics for learners and administrators
- Community-driven learning resources

---

## 👨‍💻 Project Status

**Status:** Active development 🚧

The core platform, authentication, course architecture, multi-language learning structure, problem-solving section, search, and admin management workflows are in place. The project continues to evolve toward a more complete programming-learning ecosystem.

---

## 💡 The Idea in One Sentence

> **SyntaxHub helps learners understand programming concepts once, then explore how those concepts are expressed across different programming languages.**

---

## 📄 License

This project is currently maintained as a private project. Licensing and repository access may change in the future.

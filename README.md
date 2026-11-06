# 🍲 Desi Rasoi — Simple Recipe Book

A full-stack Indian Recipe Book web application built with **Next.js (App Router)**, **Tailwind CSS**, **Next.js Route Handlers**, and the **official MongoDB driver**.

---

## 📑 Table of Contents
1. [Overview & Tech Stack](#overview--tech-stack)
2. [Server vs. Browser Execution (Key Concept)](#server-vs-browser-execution-key-concept)
3. [Architecture & 3-Layer Separation](#architecture--3-layer-separation)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Configuring MongoDB (Local or Atlas)](#configuring-mongodb-local-or-atlas)
7. [Running the Application](#running-the-application)
8. [Data Model](#data-model)
9. [API Documentation](#api-documentation)
10. [Features & Stretch Goals](#features--stretch-goals)

---

## 🛠 Overview & Tech Stack

- **Frontend**: Next.js 14 (App Router) with Tailwind CSS for modern responsive styling.
- **Backend**: Next.js Route Handlers (`app/api/.../route.js`) inside the same repository.
- **Persistence**: Official `mongodb` Node.js driver (v6.10.0) connecting to a local MongoDB instance or a free MongoDB Atlas cloud cluster.
- **Icons**: Lucide React.
- **Dependencies**: All versions pinned in [`package.json`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/package.json).

---

## 🖥 Server vs. Browser Execution (Key Concept)

Next.js App Router cleanly distinguishes between code executed on the server vs code executed in the user's browser. Here is exactly where each part runs:

| File / Directory | Layer | Runs On | Why? |
| :--- | :--- | :--- | :--- |
| [`lib/mongodb.js`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/lib/mongodb.js) | Database | **Server Only** | Connects directly to MongoDB with sensitive credentials (`MONGODB_URI`). Never exposed to browser. |
| [`lib/seed.js`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/lib/seed.js) | Database | **Server Only** | Executes `countDocuments` and `insertMany` on MongoDB to populate initial Indian recipes. |
| [`app/api/recipes/route.js`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/api/recipes/route.js) | Backend API | **Server Only** | Route Handler responding to `GET` (list + filter) and `POST` (create + validate). |
| [`app/api/recipes/[id]/route.js`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/api/recipes/[id]/route.js) | Backend API | **Server Only** | Route Handler querying MongoDB by `ObjectId`. Validates format and returns 200/400/404. |
| [`app/api/recipes/random/route.js`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/api/recipes/random/route.js) | Backend API | **Server Only** | Route Handler using MongoDB's `$sample` pipeline stage to pick a random recipe. |
| [`app/page.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/page.jsx) | Frontend | **Server Component** | Renders HTML on the server directly fetching recipes from MongoDB. Zero client-side data fetching waterfall. |
| [`app/recipes/[id]/page.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/recipes/[id]/page.jsx) | Frontend | **Server Component** | Fetches the specific recipe document on the server and renders SEO-friendly HTML to the browser. |
| [`app/add/page.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/app/add/page.jsx) | Frontend | **Browser (Client Component)** | Marked with `'use client'` to manage interactive form inputs (`useState`), handle client validation, and send `fetch('/api/recipes')`. |
| [`components/FilterBar.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/components/FilterBar.jsx) | Frontend | **Browser (Client Component)** | Uses `'use client'` to handle live click events for the "Veg only" toggle and tag selection, updating URL query parameters via Next.js router. |
| [`components/SurpriseMeButton.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/components/SurpriseMeButton.jsx) | Frontend | **Browser (Client Component)** | Marked `'use client'` to handle click events, fetch `/api/recipes/random`, and navigate the user to that recipe. |
| [`components/IngredientsList.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/components/IngredientsList.jsx) | Frontend | **Browser (Client Component)** | Interactive checklist allowing cooks to check off ingredients in real time as they cook. |
| [`components/RecipeCard.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/components/RecipeCard.jsx) | Frontend | **Server / Client** | Server Component that renders clean recipe cards with title, cooking time, veg badge, and tags. |
| [`components/VegBadge.jsx`](file:///c:/Users/HP/Desktop/gen%20ai%20exercises/day%207.10/components/VegBadge.jsx) | Frontend | **Server / Client** | Presentation component displaying the authentic Indian vegetarian (green dot) / non-vegetarian (maroon dot) symbol. |

---

## 🏛 Architecture & 3-Layer Separation

Every code file includes a comment at the very top indicating its architectural layer:
1. **Frontend Layer**: `app/page.jsx`, `app/recipes/[id]/page.jsx`, `app/add/page.jsx`, `components/*`
2. **Backend API Layer**: `app/api/recipes/route.js`, `app/api/recipes/[id]/route.js`, `app/api/recipes/random/route.js`
3. **Database Layer**: `lib/mongodb.js`, `lib/seed.js`, `lib/seedData.js`, `scripts/seed-cli.js`

```
├── app/
│   ├── api/
│   │   └── recipes/
│   │       ├── route.js            # [BACKEND API] GET /api/recipes, POST /api/recipes
│   │       ├── [id]/
│   │       │   └── route.js        # [BACKEND API] GET /api/recipes/[id]
│   │       └── random/
│   │           └── route.js        # [BACKEND API] GET /api/recipes/random ($sample)
│   ├── recipes/
│   │   └── [id]/
│   │       ├── page.jsx            # [FRONTEND] Server-rendered recipe detail page
│   │       └── not-found.jsx       # [FRONTEND] 404 state for invalid IDs
│   ├── add/
│   │   └── page.jsx                # [FRONTEND] Client-side recipe creation form
│   ├── globals.css                 # [FRONTEND] Global styles & Tailwind
│   ├── layout.jsx                  # [FRONTEND] Root layout with Navbar
│   └── page.jsx                    # [FRONTEND] Server-rendered home page grid & filters
├── components/
│   ├── FilterBar.jsx               # [FRONTEND] Veg toggle & tag pills
│   ├── IngredientsList.jsx         # [FRONTEND] Interactive checklist
│   ├── Navbar.jsx                  # [FRONTEND] Header navigation
│   ├── RecipeCard.jsx              # [FRONTEND] Recipe card display
│   ├── SurpriseMeButton.jsx        # [FRONTEND] "Surprise Me" action
│   └── VegBadge.jsx                # [FRONTEND] Indian Veg / Non-Veg symbol
├── lib/
│   ├── mongodb.js                  # [DATABASE] Reusable connection singleton
│   ├── seed.js                     # [DATABASE] Automatic seeder on empty DB
│   └── seedData.js                 # [DATABASE] 5 sample authentic Indian recipes
├── scripts/
│   └── seed-cli.js                 # [DATABASE] CLI script for manual seeding (`npm run seed`)
├── .env.local.example              # [CONFIG] Sample environment variables
├── .env.local                      # [CONFIG] Local environment variables
└── README.md
```

---

## 📦 Prerequisites

1. **Node.js**: v18.17.0 or higher (v20+ / v22+ recommended). Check with `node -v`.
2. **npm**: v9 or higher. Check with `npm -v`.
3. **MongoDB**:
   - **Option A (Cloud - Recommended & Free)**: Free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas/database) (M0 Sandbox).
   - **Option B (Local)**: Community MongoDB installed and running on port 27017, or Docker container:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo:latest
     ```

---

## 🚀 Installation & Setup

1. **Clone or Navigate to the project directory**:
   ```bash
   cd "day 7.10"
   ```

2. **Install pinned dependencies**:
   ```bash
   npm install
   ```

---

## ⚙️ Configuring MongoDB (Local or Atlas)

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### Option 1: Free MongoDB Atlas Cloud (Zero local install)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free).
2. Create a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a user (e.g. `recipe_user` and password).
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere).
5. Click **Connect** → **Drivers** → Node.js and copy the connection string.
6. Paste into your `.env.local` file:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/recipe_book?retryWrites=true&w=majority
   MONGODB_DB=recipe_book
   ```

### Option 2: Local MongoDB
If running MongoDB locally or in Docker:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/recipe_book
MONGODB_DB=recipe_book
```

---

## 🏃 Running the Application

### 1. Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

### 2. Optional: Seed or Reset Sample Data via CLI
The application automatically seeds 5 authentic Indian recipes on first visit if the database is empty. You can also explicitly run the seed CLI script at any time:
```bash
npm run seed
```

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## 📋 Data Model (Document)

Stored in the `recipes` collection in MongoDB:

```json
{
  "_id": "ObjectId('6720d588f28ab01c54b9d311')",
  "title": "Butter Chicken (Murgh Makhani)",
  "minutes": 45,
  "veg": false,
  "tags": ["curry", "chicken", "north-indian", "creamy", "dinner"],
  "ingredients": [
    "800g boneless chicken thighs, cut into bite-sized pieces",
    "1 cup thick plain yogurt (curd)",
    "2 tbsp ginger-garlic paste",
    "2 tsp Kashmiri red chili powder",
    "1 tsp garam masala",
    "3 tbsp unsalted butter",
    "2 cups tomato puree",
    "1/2 cup heavy cream",
    "1 tbsp kasuri methi (dried fenugreek leaves)",
    "Salt to taste"
  ],
  "steps": [
    "Marinate chicken with yogurt, spices, and salt for at least 30 mins.",
    "Sear chicken pieces over medium-high heat until lightly charred.",
    "Sauté ginger-garlic and simmer tomato puree until gravy thickens.",
    "Add chicken and simmer gently for 10 minutes.",
    "Stir in heavy cream and crushed kasuri methi for a silky velvet finish."
  ],
  "createdAt": "2026-10-01T10:00:00.000Z"
}
```

---

## 🌐 API Documentation

All routes reside in `app/api/...` and validate inputs, returning appropriate HTTP status codes (200, 201, 400, 404, 500).

### 1. `GET /api/recipes`
Retrieves a list of recipes, optionally filtered by tag or vegetarian status. Auto-seeds the database if empty.

- **Query Parameters**:
  - `tag` (optional): Filter recipes containing this tag (case-insensitive, e.g. `?tag=curry`).
  - `veg` (optional): Filter by vegetarian flag (`?veg=true` or `?veg=false`).
- **Response**: `200 OK`
  ```json
  {
    "recipes": [
      {
        "_id": "6720d588f28ab01c54b9d311",
        "title": "Paneer Butter Masala",
        "minutes": 35,
        "veg": true,
        "tags": ["paneer", "curry", "vegetarian", "north-indian", "dinner"],
        "ingredients": ["..."],
        "steps": ["..."],
        "createdAt": "2026-10-02T11:00:00.000Z"
      }
    ]
  }
  ```

### 2. `POST /api/recipes`
Creates a new recipe in MongoDB. Validates all inputs on the backend.

- **Request Body**:
  ```json
  {
    "title": "Amritsari Chole Bhature",
    "minutes": 40,
    "veg": true,
    "tags": ["chole", "punjabi", "spicy", "lunch"],
    "ingredients": [
      "2 cups soaked chickpeas",
      "2 tea bags",
      "2 onions, finely chopped",
      "1 tbsp chole masala",
      "2 tbsp ghee"
    ],
    "steps": [
      "Boil soaked chickpeas with tea bags and salt until tender.",
      "Heat ghee in a pan and sauté onions until brown.",
      "Stir in chole masala, cooked chickpeas, and simmer for 15 minutes."
    ]
  }
  ```
  *(Note: `tags`, `ingredients`, and `steps` also accept string inputs formatted as comma-separated or newline-separated values)*.

- **Responses**:
  - `201 Created`:
    ```json
    {
      "message": "Recipe created successfully",
      "recipe": { "_id": "...", "title": "Amritsari Chole Bhature", ... }
    }
    ```
  - `400 Bad Request` (Validation error):
    ```json
    { "error": "Cooking time must be a positive integer in minutes." }
    ```

### 3. `GET /api/recipes/[id]`
Retrieves full details of a specific recipe by its 24-character hexadecimal MongoDB `ObjectId`.

- **Responses**:
  - `200 OK`: `{ "recipe": { ... } }`
  - `400 Bad Request`: `{ "error": "Invalid recipe ID format. Must be a 24-character hexadecimal string." }`
  - `404 Not Found`: `{ "error": "Recipe not found with the specified ID." }`

### 4. `GET /api/recipes/random` *(Stretch Goal: "Surprise Me")*
Uses MongoDB's `$sample` pipeline stage (`db.collection('recipes').aggregate([{ $sample: { size: 1 } }])`) to return a random recipe.

- **Responses**:
  - `200 OK`:
    ```json
    {
      "id": "6720d588f28ab01c54b9d311",
      "recipe": { ... }
    }
    ```

---

## ✨ Seeded Indian Recipes (First Run)

When you first launch the app with a connected database, 5 sample authentic Indian recipes are automatically inserted:
1. **Butter Chicken (Murgh Makhani)** — Non-Veg (45 mins)
2. **Paneer Butter Masala** — Vegetarian (35 mins)
3. **Crispy Masala Dosa** — Vegetarian (40 mins)
4. **Kashmiri Rogan Josh** — Non-Veg (60 mins)
5. **Dhaba Style Dal Tadka** — Vegetarian (25 mins)

---

## 🎯 Verification & Testing

To test everything:
1. **View Home Page**: Open `http://localhost:3000`. You will see the responsive recipe grid.
2. **Toggle "Veg Only"**: Click the "Veg Only" button; notice only vegetarian recipes (green badges) are displayed.
3. **Filter by Tag**: Click any tag pill (e.g. `#curry` or `#breakfast`) to filter recipes.
4. **Surprise Me**: Click the "Surprise Me" button in the navigation or hero banner to immediately open a randomly selected recipe via MongoDB's `$sample`.
5. **Add Recipe**: Click "Add Recipe", fill in the form (or use the handy "Fill Sample" button), and submit to test backend validation and persistence.
6. **Ingredients Checklist**: On any recipe detail page (`/recipes/[id]`), click ingredients to check them off as you cook.


# Student Management System (SMS)

A full-stack student management application for organizing student records, courses, attendance, fees, and administrative activity.

## About the Project

SMS provides a centralized dashboard for managing day-to-day educational administration. The application uses React for the user interface and Express.js for the API, with data stored through the project's backend data/database modules.

### Features

- Dashboard overview
- Student creation, editing, listing, and profiles
- Course creation and editing
- Attendance tracking
- Fee records and fee management
- Authentication and protected application pages
- Recent activity monitoring

## Project Structure

```text
SMS/
├── backend/          # Express API, routes, middleware, and data storage
└── fronted/          # React and Vite client application
```

## Prerequisites

- Node.js 18 or newer
- npm

## How to Run the Project

Open two terminals from the repository root.

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The backend runs on `http://localhost:5000` by default. The API health endpoint is available at:

```text
http://localhost:5000/api/health
```

### 2. Start the Frontend

In a second terminal:

```bash
cd fronted
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

## Available Frontend Commands

Run these from the `fronted` directory:

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Available Backend Commands

Run these from the `backend` directory:

```bash
npm start       # Start the API server
npm run dev     # Start with nodemon for automatic reloads
```

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Recharts
- **Backend:** Node.js, Express.js
- **Authentication:** JSON Web Tokens and bcrypt
- **Data:** JSON/database modules in the backend

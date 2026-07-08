# ImmuniTrack Frontend

ImmuniTrack Frontend is the React browser app for the ImmuniTrack Immunisation Tracker. It helps caregivers register children, view vaccine timelines, mark received immunisations, and read reminders. Admins and health workers can review missed or upcoming visits, manage schedules, and view simple reports.

This folder is a separate frontend repo. Run it together with the `immunitrack-backend` repo.

## Technologies

- React for the user interface
- React Router for pages and protected routes
- Axios for API requests
- Bootstrap plus custom CSS for responsive styling
- Vite for the development server and production build
- JWT stored in browser local storage for demo authentication

## Main Features

- Public ImmuniTrack information pages
- Login and registration screens
- Caregiver dashboard with child profiles and immunisation timelines
- Reminder list for upcoming and missed immunisation visits
- Admin dashboard with child, schedule, facility, and report views
- Responsive layout for laptops, tablets, and phones

## Requirements

- Node.js 18 or newer
- npm
- ImmuniTrack Backend running at `http://localhost:5050/api`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Confirm the API URL in `.env`:

```env
VITE_API_URL=http://localhost:5050/api
```

## Run The Frontend

```bash
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

## Run With The Backend

Start the backend in a separate terminal:

```bash
cd ../immunitrack-backend
npm install
cp .env.example .env
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
npm run dev
```

Then start this frontend repo:

```bash
cd ../immunitrack-frontend
npm install
cp .env.example .env
npm run dev
```

## Demo Login Accounts

- Admin or health worker: `admin@immunitrack.test` / `Admin123!`
- Caregiver: `amina@immunitrack.test` / `Care123!`
- Caregiver: `sarah@immunitrack.test` / `Care123!`
- Caregiver: `prossy@immunitrack.test` / `Care123!`

## Project Structure

```text
src/assets/       Images used by the app
src/context/      Authentication state provider
src/pages/        Page components and dashboard views
src/services/     Axios API client and helpers
src/App.jsx       Route definitions
src/main.jsx      React entry point
src/styles.css    Application styles
```

## Useful Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build in dist/
npm run preview  # Preview the production build locally
```

## How The App Talks To The API

The Axios client in `src/services/api.js` reads `VITE_API_URL` from `.env`. During local development it should point to:

```text
http://localhost:5050/api
```

After login, the app stores the JWT token and sends it in the `Authorization` header for protected API calls.

## Learning Notes

Start with `src/App.jsx` to understand the page routes. Then read `src/pages/ImmuniTrackPages.jsx` for the main screens and `src/context/AuthContext.jsx` for login state. API calls are grouped in `src/services/api.js`.

ImmuniTrack is a learning project and reminder tool. It does not replace advice from a qualified health worker.

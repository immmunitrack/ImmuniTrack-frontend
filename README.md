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
- Login and registration screens with split-screen layout
- Caregiver dashboard with child profiles and immunisation timelines
- Calendar view for upcoming immunisations
- Reminder list with real-time notification bell
- Admin dashboard with child, schedule, facility, and report views
- Light and dark theme toggle
- QR code generation for child immunisation cards
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

3. Start the development server:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

## Project Structure

```text
src/
  assets/       Images and icons
  components/   Shared UI components (Navbar, Loading, etc.)
  context/      Auth context for session management
  layouts/      Dashboard layout with sidebar
  pages/        Page components for each route
  services/     Axios API client
  styles.css    Global styles and theme tokens
  App.jsx       Route definitions
  main.jsx      App entry point
```

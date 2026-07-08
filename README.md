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
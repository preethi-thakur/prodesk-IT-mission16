# TaskFlow — AI-Powered Task Management System

Designed and developed TaskFlow, a modern task management application featuring task CRUD operations, task search and filtering, project management, calendar tracking, drag-and-drop functionality, Redux state management, responsive design, authentication, and AI-powered subtask generation using Next.js, Tailwind CSS, and the Groq API.


# TaskFlow

TaskFlow is a modern productivity and project management application designed to help users organize, track, and manage tasks through a centralized workspace with an intuitive and responsive user experience.

# Features

- Create, edit, and delete tasks
- Task status and priority management
- Task search and filtering
- Drag-and-drop task organization
- Project management
- Calendar-based task tracking
- AI-powered subtask generation
- User registration and login
- Protected workspace routes
- Team member management
- Profile and settings
- Loading, empty, and error states
- Responsive design for desktop, tablet, and mobile
- Smooth animations and interactive UI

# Tech Stack

- Next.js
- React
- JavaScript
- Redux Toolkit
- Tailwind CSS
- Groq API
- Framer Motion
- Heroicons

# Project Structure


TaskFlow/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── redux/
│   └── styles/
├── public/
├── package.json
├── next.config.js
├── postcss.config.js

# Installation

# Prerequisites

- Node.js 18+
- npm

# Run Locally

    npm install

Create a `.env.local` file:

    GROQ_API_KEY=your_groq_api_key

Start the development server:

    npm run dev

Open:

    http://localhost:3000

## Production Build

    npm run build

    npm start

## Available Scripts

    npm run dev

Starts the development server.

    npm run build

Creates the production build.

    npm start

Runs the production server.

# Application Modules

- Dashboard
- Task Management
- Kanban Board
- Projects
- Calendar
- Search and Filtering
- AI Subtask Generation
- Team Members
- Profile
- Settings
- Authentication
- Responsive Navigation

# State Management

Redux Toolkit is used to manage:

- Authentication state
- Tasks
- Projects
- User information
- Application state

## AI Integration

The Groq API is used to generate actionable subtasks from a task title and description.

The AI feature helps users break larger tasks into smaller and manageable steps while keeping the generated suggestions within the existing task workflow.

## Data Handling

Application state is managed through Redux Toolkit, while API communication is handled through Next.js API routes.

The Groq API key is stored using environment variables and is handled through the server-side API route.

## Responsive Design

The application is optimized for:

- Desktop
- Tablet
- Mobile

#
# Future Improvements

- Real-time collaboration
- Persistent database integration
- Advanced notifications
- Task reminders
- Activity history
- File attachments
- Advanced project analytics
- Real-time task updates





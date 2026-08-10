AI-Powered Task Management System

A modern AI-powered task management platform built with Next.js thathelps users create, organize, prioritize, and track tasks efficiently.The application combines task management, project organization, calendarviews, authentication, team collaboration, and AI-powered subtaskgeneration in a single responsive workspace.

Features

User registration and login

Password recovery

Protected workspace routes

Create, edit, and delete tasks

Task priority and status management

Task descriptions and due dates

Task search and filtering

Drag-and-drop task management

Project management

Calendar view

Team member management

User profile and settings

AI-powered subtask generation using Groq

Responsive interface for desktop, tablet, and mobile

Toast notifications

Smooth UI animations

Centralized state management with Redux Toolkit

Tech Stack

Frontend

Next.js

React

JavaScript

Tailwind CSS

State Management

Redux Toolkit

React Redux

AI and Backend

Next.js API Routes

Groq API

UI and Utilities

Framer Motion

Heroicons

ESLint

Project Structure

src/
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (workspace)/
│   │   ├── calendar/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── settings/
│   │   └── team-members/
│   │
│   ├── api/
│   │   └── generate-subtasks/
│   │
│   ├── layout.js
│   ├── page.js
│   └── providers.js
│
├── lib/
├── redux/
└── styles/

AI Subtask Generation

The application uses the Groq API to generate actionable subtasks fromlarger tasks.

For example:

Input

Build a user authentication system

Generated Subtasks

1. Create the login interface
2. Create the registration interface
3. Configure authentication
4. Implement protected routes
5. Test authentication flows

This feature helps users break complex work into smaller and moremanageable steps.

Getting Started

Prerequisites

Make sure the following are installed:

Node.js

npm

Installation

Clone the repository and navigate to the project directory.

Install the project dependencies:

npm install

Environment Variables

Create a .env.local file in the project root:

GROQ_API_KEY=your_groq_api_key

Replace your_groq_api_key with your own Groq API key.

Do not commit .env.local or any file containing real API keys toGitHub.

Run the Development Server

npm run dev

Open the application in your browser:

http://localhost:3000

Production Build

Create a production build:

npm run build

Start the production server:

npm start

Application Routes

Authentication

/login
/register
/forgot-password

Workspace

/
/calendar
/projects
/profile
/settings
/team-members

API

/api/generate-subtasks

Security

API credentials are stored using environment variables.

The Groq API key is accessed through the server-side API route.

Sensitive environment files should not be committed to GitHub.

Authentication and workspace functionality are separated intodedicated routes.

API credentials should be regenerated if they are accidentallyexposed.

Responsive Design

The application is designed to provide a consistent experience across:

Desktop

Laptop

Tablet

Mobile

The interface adapts its layout and navigation according to theavailable screen size.

Core Workflow

User Authentication
        ↓
Workspace Dashboard
        ↓
Create or Manage Tasks
        ↓
Organize Tasks into Projects
        ↓
Track Tasks Through Calendar
        ↓
Generate AI Subtasks When Required
        ↓
Monitor and Update Progress

Purpose

The goal of this project is to provide a centralized productivityworkspace where users can manage tasks, organize projects, trackschedules, collaborate with team members, and use AI assistance to breakcomplex tasks into actionable subtasks.

Development Notes

The project follows a component-based architecture using Next.js andReact. Application state is managed with Redux Toolkit, while the AIfunctionality is exposed through a Next.js API route to keep the GroqAPI key on the server side.

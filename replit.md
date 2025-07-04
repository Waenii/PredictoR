# PredictoR - AI-Powered Prediction Betting Platform

## Overview

PredictoR is a modern web application that allows users to place bets on prediction events using an AI-powered resolution system. The platform features a clean, dark-themed interface with real-time betting functionality and automated event resolution through OpenAI integration.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI GPT-4o for automated event resolution
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query for server state management

### Monorepo Structure
The application follows a monorepo pattern with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schema
- Root-level configuration files for build tools and dependencies

## Key Components

### Frontend Architecture
- **Component Library**: Comprehensive shadcn/ui component system with dark theme
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for efficient server state management with caching
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS custom properties for theming

### Backend Architecture
- **API Structure**: RESTful endpoints for users, events, and betting operations
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **AI Service**: OpenAI integration for automated event resolution
- **Development Setup**: Vite middleware for hot reloading during development

### Database Schema
- **Users**: Basic user management with balance tracking
- **Events**: Prediction events with categories, descriptions, and resolution status
- **Bets**: User betting records with prediction outcomes and results

## Data Flow

### Betting Process
1. User views active prediction events on the home page
2. User selects a prediction (YES/NO) and places a bet
3. System validates user balance and creates bet record
4. AI automatically resolves events using OpenAI GPT-4o
5. User balance updates based on bet outcomes

### AI Resolution System
Events are automatically resolved using OpenAI's GPT-4o model, which:
- Analyzes event titles and descriptions
- Provides YES/NO determinations with confidence scores
- Returns reasoning for resolution decisions

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon serverless database
- **AI Service**: OpenAI API for event resolution
- **UI Components**: Extensive Radix UI component library
- **Validation**: Zod for runtime type checking

### Development Tools
- **Build System**: Vite for fast development and production builds
- **Type Safety**: TypeScript throughout the stack
- **Database Migrations**: Drizzle Kit for schema management
- **Code Quality**: ESBuild for optimized production builds

## Deployment Strategy

### Build Process
- Frontend builds to `dist/public` directory
- Backend compiles to `dist/index.js` using ESBuild
- Single deployment artifact containing both frontend and backend

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- OpenAI API key configuration for AI resolution features
- Development vs production environment handling

### Development Workflow
- `npm run dev` - Starts development server with hot reloading
- `npm run build` - Creates production build
- `npm run start` - Runs production server
- `npm run db:push` - Applies database schema changes

## Changelog
- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
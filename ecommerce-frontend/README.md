# E-Commerce Frontend

A modern, minimalist and scalable e-commerce frontend application built with React 18+, TypeScript, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand (client-side) + TanStack Query (server-side)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Architecture

This application follows the Backend for Frontend (BFF) pattern and implements:

- Feature-based folder structure
- TypeScript strict mode
- Responsive design (mobile-first)
- Accessibility standards (WCAG 2.1 AA)
- Performance optimization with lazy loading

## Project Structure

```
src/
├── components/        # Shared UI components
│   ├── ui/            # shadcn/ui components
│   └── shared/        # Custom shared components
├── features/          # Business logic modules
│   ├── auth/          # Authentication
│   ├── cart/          # Shopping cart
│   ├── catalog/       # Product catalog
│   └── checkout/      # Order processing
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── pages/             # Route pages
├── services/          # API services
└── layouts/           # Layout components
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Features

- 🔐 Secure authentication with Keycloak integration
- 🛒 Shopping cart with guest/user session management
- 🔍 Product search and filtering
- 📱 Fully responsive design
- ♿ Accessibility compliant
- 🚀 Performance optimized
- 🎨 Modern UI with shadcn/ui components

## API Integration

The frontend connects to a microservices backend through an API Gateway at `http://localhost:8080`. All requests include:

- `withCredentials: true` for session management
- Automatic CSRF token handling
- Guest user tracking via `X-Guest-Id` header

## Development Guidelines

- Use TypeScript strict mode
- Follow the established folder structure
- Use shadcn/ui components for UI elements
- Implement proper error handling
- Write tests for critical functionality
- Maintain accessibility standards
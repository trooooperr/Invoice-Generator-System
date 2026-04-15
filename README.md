# HumTum POS System (V2)

A production-grade Restaurant POS & Management System built for **HumTum Bar & Restaurant**.

Built using:
Node.js • Express • MongoDB • Redis • React (Vite) • Docker • Jest • Supertest • Artillery

# Version Upgrade (V1 → V2)

👉 V1 Live: https://humtum.onrender.com/

V2 transforms the system from a basic POS into a **scalable, production-ready restaurant management platform** with performance optimization, automation, and deployment readiness.

# Key Production-Level Additions in V2

## Role-Based Access Control (RBAC)
- Admin, Manager, Staff roles
- Controlled access to billing, inventory, reports, settings

## Advanced Inventory System
- Real-time stock tracking
- Order-based automatic stock deduction
- Category-based item management

## Admin Settings Panel (No-Code Control)
- Central backend configuration UI
- Manage:
  - Email settings
  - Restaurant configuration
  - System preferences
- Eliminates need for code-level changes

## Analytics Dashboard
- Revenue charts
- Top-selling items
- Business insights for owners

## Fully Responsive UI
- Mobile / Tablet / Desktop optimized
- Designed for real POS usage

## UI Enhancements
- Dark mode / Light mode
- Improved UX consistency
- Faster navigation for billing workflow

## Worker & Salary Management
- Worker records
- Salary tracking
- Transaction history

### Communication & Automation
- WhatsApp bill sharing
- Email/SMS bill sending
- Daily automated reports:
  - Sales summary
  - Orders report
  - Inventory status

# System Architecture Flow

Frontend (React + Vite)
        ↓
Express API Layer (app.js)
        ↓
Business Logic Layer
        ↓
MongoDB (Primary DB)
        ↓
Redis (Caching Layer for performance optimization)

# Performance Improvements

- Redis caching for menu & inventory APIs
- Reduced MongoDB query load (significant performance boost)
- Faster API response times (2–5ms cached responses)
- Optimized backend request handling

# Testing & Quality Assurance

## Unit & Integration Testing
- Jest (unit tests)
- Supertest (API testing)

## Load & Stress Testing
- Artillery-based load testing
- Simulated traffic:
  - Spike testing
  - Stress testing
  - Soak testing (long-duration stability)

## Health Monitoring
- `/api/health` endpoint includes:
  - MongoDB status
  - Redis status
  - Server uptime

# Docker Deployment (Production Ready)

## Run System

```bash
docker compose up --build
```

## Stop System

```bash
docker compose down
```

## Services
- App container: `humtum-pos`
- Redis container: `humtum-redis`

# Local Development Setup

```bash
npm install
cd frontend && npm install
cp .env.example .env
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:3000

# Production Build

```bash
npm run build
npm start
```

App runs on:
http://localhost:3000

# Environment Variables

## Database
- CLOUD_MONGO_URI
- LOCAL_MONGO_URI
- USE_LOCAL_DB

## Server
- PORT

## Redis
- REDIS_URL

## Email System
- GMAIL_SENDER
- GMAIL_APP_PASSWORD
- ADMIN_EMAIL

# API Endpoints

- GET /api/menu → Fetch menu
- GET /api/health → System health check
- POST /api/orders → Create order
- GET /api/inventory → Inventory data

# Deployment Notes

- Frontend and backend are unified in production build
- Redis is optional but improves performance
- Works with Docker or direct Node.js deployment
- Environment variables control all production configs

# Final System Position

V2 is now a **complete restaurant ERP-level system**, including:

- POS Billing System
- Inventory Management
- Staff & Salary System
- Analytics Dashboard
- Automation (Email/WhatsApp/Reports)
- Caching & Performance Layer (Redis)
- Full Testing Suite
- Dockerised Production Deployment

# ⭐ Final Note

This system is production-ready for real restaurant deployment with scalable architecture, caching optimization, automation features, and full DevOps support.
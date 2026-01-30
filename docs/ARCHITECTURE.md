# Architecture

## System Design

CollaBuild follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  - Canvas Drawing Engine                            │
│  - Real-time State Management (Redux)               │
│  - WebSocket Client (Socket.io)                     │
│  - Responsive UI (Tailwind)                         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────┐
│              Backend (Node.js/Express)              │
│  - REST API                                         │
│  - WebSocket Server (Socket.io)                     │
│  - Authentication (JWT)                             │
│  - Business Logic                                   │
└──────────────────────┬──────────────────────────────┘
                       │ Database Query/Cache
         ┌─────────────┼──────────────┐
         │             │              │
    ┌────▼──┐   ┌─────▼─────┐   ┌───▼───┐
    │PostgreSQL│   │  Redis   │   │ Files │
    └─────────┘   └──────────┘   └───────┘
```

## Key Components

### Frontend
- **Canvas API**: Hardware-accelerated drawing
- **Redux Store**: Centralized state management
- **Socket.io Client**: Real-time communication
- **React Components**: Modular UI

### Backend
- **Express Server**: HTTP API
- **Socket.io**: Real-time collaboration
- **Prisma ORM**: Type-safe database access
- **JWT Auth**: Secure authentication

### Database
- **PostgreSQL**: Primary data store
- **Redis**: Caching & pub/sub

## Real-time Collaboration Flow

1. User draws on canvas
2. Local state updated (optimistic update)
3. Shape data sent via WebSocket
4. Server broadcasts to other users
5. Remote users' canvases updated
6. Data persisted to database

## Scalability Considerations

- Database indexing for large projects
- WebSocket connection pooling
- Redis for horizontal scaling
- CDN for static assets
- Load balancing with Nginx

# CollaBuild - Real-time Collaborative Design Platform

A modern, full-stack collaborative design and prototyping platform where teams can create, edit, and iterate together in real-time. Think of it as a simplified Figma with powerful real-time collaboration features, version history, and an intuitive canvas experience.

![CollaBuild](https://img.shields.io/badge/CollaBuild-v1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Features

### Core Capabilities
- **🎨 Real-time Collaboration** - Multiple users drawing and designing simultaneously with live cursor tracking
- **🛠️ Rich Canvas Tools** - Rectangles, circles, lines, text, image uploads, freehand drawing, with layer management
- **👥 Workspace & Projects** - Organize designs, invite team members, manage permissions
- **💬 Comments & Mentions** - Real-time commenting with @mentions and resolution tracking
- **⏮️ Version History** - Full undo/redo with persistent version snapshots
- **📤 Export Options** - Download as PNG, SVG, or PDF
- **🎭 Dark Mode** - Beautiful dark and light theme support
- **🔐 Authentication** - Secure JWT-based authentication with OAuth ready
- **📊 Activity Dashboard** - View recent projects, activity feed, collaboration metrics

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Canvas API** for rendering
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates
- **Vite** for fast development

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Socket.io** for WebSocket communication
- **PostgreSQL** for data persistence
- **Prisma ORM** for database management
- **JWT** for authentication
- **Redis** for caching and pub/sub

### DevOps & Deployment
- **Docker** for containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **AWS/Railway/Vercel** ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for production)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ari-Han-t/collabuild.git
cd collabuild
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- WebSocket: ws://localhost:3000

### Using Docker Compose
```bash
docker-compose up -d
```

## 📁 Project Structure

```
collabuild/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── websocket/      # Socket.io handlers
│   │   ├── utils/          # Utilities
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Database schema
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── types/          # TypeScript types
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── canvas/         # Canvas logic
│   │   └── App.tsx         # Main component
│   ├── .env.example        # Environment template
│   └── package.json
├── docs/                   # Documentation
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔑 Key Features Deep Dive

### Real-time Collaboration
- WebSocket connections using Socket.io
- Live cursor positions with user avatars
- Conflict-free collaborative editing (CRDT principles)
- Presence awareness (who's online, viewing what)

### Canvas System
- Efficient rendering with requestAnimationFrame
- Layer management with depth ordering
- Transform tools (move, resize, rotate)
- Grid and snap-to-grid support
- Zoom and pan functionality

### State Management
- Redux for client-side state
- Optimistic updates for smooth UX
- Conflict resolution for simultaneous edits
- Offline support with sync on reconnect

### Database
- Normalized schema for scalability
- Indexed queries for performance
- Audit logging for history
- Soft deletes for data retention

## 📚 API Documentation

### Authentication
```
POST /api/auth/register      - Create new account
POST /api/auth/login         - Login with credentials
POST /api/auth/refresh       - Refresh JWT token
POST /api/auth/logout        - Logout
```

### Projects
```
GET    /api/projects         - List user's projects
POST   /api/projects         - Create new project
GET    /api/projects/:id     - Get project details
PUT    /api/projects/:id     - Update project
DELETE /api/projects/:id     - Delete project
```

### Collaboration
```
WebSocket events (Socket.io):
- drawing:update             - Send canvas updates
- drawing:delete             - Delete object
- cursor:move                - Broadcast cursor position
- comment:add                - Add comment
- version:create             - Create version snapshot
```

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
npm run test         # Run tests
```

**Frontend:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

## 🔒 Security Features

- JWT-based authentication
- CORS protection
- Rate limiting
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Input validation and sanitization
- Environment variable management

## 📦 Deployment

### Environment Variables

**Backend (.env)**
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_URL=redis://...
CORS_ORIGIN=https://yourdomain.com
```

**Frontend (.env)**
```
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Deploy to Railway, Vercel, or AWS
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built with ❤️ by Arihant Gupta

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Version:** 1.0.0  
**Last Updated:** January 2026

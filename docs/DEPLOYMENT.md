# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)
- AWS account or Railway/Vercel account

## Environment Setup

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/collabuild
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRE=7d
REDIS_URL=redis://host:6379
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

## Docker Deployment

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate
```

## Railway Deployment

1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Add Redis plugin
4. Set environment variables
5. Deploy backend and frontend separately

## Vercel Deployment (Frontend)

```bash
npm run build
vercel deploy
```

## AWS Deployment

1. Create EC2 instance
2. Install Node.js and PostgreSQL
3. Clone repository
4. Setup environment variables
5. Run `npm install && npm run build`
6. Use PM2 for process management
7. Setup Nginx reverse proxy

## Database Migrations

```bash
# Run pending migrations
npm run db:migrate

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (dev only)
npx prisma migrate reset
```

## SSL Certificates

Use Let's Encrypt with Certbot:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

## Monitoring

- Use PM2 for process monitoring
- Setup error tracking (Sentry)
- Monitor database performance
- Use CDN for frontend assets

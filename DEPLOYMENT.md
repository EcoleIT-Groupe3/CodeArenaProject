# CodeArena Deployment Guide

This guide will help you deploy the CodeArena application using Docker and Nginx.

## Prerequisites

- Docker and Docker Compose installed on your system
- At least 2GB of available RAM
- Port 3000 available for the frontend

## Architecture

The application consists of three main containers:

1. **PostgreSQL** (Internal only) - Database server
2. **Backend** (Internal only) - Node.js/Express API server with WebSocket support
3. **Frontend** (Port 3000) - React application served by Nginx

Only the frontend port (3000) is exposed to the host machine. The backend and database communicate internally through Docker's network.

## Quick Start

1. **Clone the repository** (if not already done)

2. **Configure environment variables**

   Edit the `.env` file in the root directory:

   ```bash
   # Change this to a strong random secret in production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Database credentials (optional, defaults are already set)
   POSTGRES_DB=codearena
   POSTGRES_USER=codearena_user
   POSTGRES_PASSWORD=codearena_password
   ```

3. **Build and start the containers**

   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build all three Docker images
   - Start PostgreSQL and wait for it to be healthy
   - Run database migrations automatically
   - Start the backend API server
   - Build and start the frontend

4. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Container Details

### PostgreSQL Container
- **Container Name**: `codearena-postgres`
- **Image**: `postgres:16-alpine`
- **Port**: 5432 (internal only)
- **Volume**: `postgres_data` for data persistence
- **Health Check**: Enabled with 10s interval

### Backend Container
- **Container Name**: `codearena-backend`
- **Port**: 5000 (internal only)
- **Features**:
  - RESTful API endpoints
  - WebSocket support for real-time features
  - JWT-based authentication
  - Code execution service

### Frontend Container
- **Container Name**: `codearena-frontend`
- **Port**: 3000 (exposed to host)
- **Web Server**: Nginx
- **Features**:
  - React SPA with TypeScript
  - Monaco code editor
  - Real-time updates via WebSockets

## Database Migrations

Database migrations run automatically when the PostgreSQL container starts for the first time. The migration files are located in:

```
backend/database/migrations/
├── 001_create_tables.sql
├── 002_add_triggers.sql
├── 003_add_test_cases.sql
└── 004_add_rooms_and_realtime.sql
```

## Stopping the Application

To stop all containers:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

## Production Deployment

For production deployment:

1. **Change the JWT secret** in `.env` to a strong random value:
   ```bash
   JWT_SECRET=$(openssl rand -hex 32)
   ```

2. **Update database credentials** in `.env`

3. **Configure CORS** in `compose.yml`:
   ```yaml
   environment:
     CORS_ORIGIN: https://yourdomain.com
   ```

4. **Use a reverse proxy** (like Nginx or Traefik) in front of the frontend container

5. **Enable HTTPS** using Let's Encrypt or your SSL certificate

6. **Set up regular backups** for the PostgreSQL database:
   ```bash
   docker exec codearena-postgres pg_dump -U codearena_user codearena > backup.sql
   ```

## Troubleshooting

### Container fails to start

Check logs:
```bash
docker-compose logs [container_name]
```

### Database connection issues

Ensure PostgreSQL is healthy:
```bash
docker-compose ps
```

Check backend logs:
```bash
docker-compose logs backend
```

### Frontend cannot connect to backend

Verify backend is running:
```bash
docker-compose logs backend
```

Check if backend health endpoint responds:
```bash
docker exec codearena-backend wget -qO- http://localhost:5000/api/health
```

### Port 3000 already in use

Change the frontend port in `compose.yml`:
```yaml
ports:
  - "8080:80"  # Use port 8080 instead
```

## Security Notes

- **Never commit** the `.env` file with production credentials
- **Change the JWT_SECRET** before deploying to production
- **Use strong database passwords** in production
- **Keep Docker and all images updated** regularly
- **Configure firewall rules** to allow only necessary ports

## Monitoring

View real-time logs:
```bash
docker-compose logs -f
```

View specific service logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

Monitor resource usage:
```bash
docker stats
```

## Backup and Restore

### Backup Database

```bash
docker exec codearena-postgres pg_dump -U codearena_user codearena > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
cat backup.sql | docker exec -i codearena-postgres psql -U codearena_user codearena
```

## Support

For issues or questions, please check the application logs and ensure all environment variables are correctly set.

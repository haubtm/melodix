# Melodix Backend API

The backend service for the Melodix Music Streaming Platform, built with [NestJS](https://nestjs.com/).

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MariaDB (via Prisma ORM)
- **Caching**: Redis
- **File Storage**: AWS S3
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- MySQL/MariaDB (or use the provided Docker container)

### Installation

1.  **Clone the repository** and navigate to the backend directory:

    ```bash
    cd backend
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in your credentials:
    ```bash
    cp .env.example .env
    ```
    _Make sure to configure `DATABASE_URL`, `REDIS_HOST`, and AWS S3 credentials._

### Running Local Development Infrastructure

Start the Database and Redis containers:

```bash
docker compose up -d melodix-db melodix-redis
```

### Database Migration

Apply database schema:

```bash
npx prisma migrate dev
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at: `http://localhost:3000`
Swagger Documentation: `http://localhost:3000/docs`

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📦 Deployment (AWS EC2)

This project is configured with **GitHub Actions** for automatic deployment to AWS EC2.

- **Workflow**: `.github/workflows/deploy-backend.yml`
- **Domain**: `https://api.melodix.lebahau.site`
- **Infrastructure**: Nginx (Reverse Proxy) -> Docker Container (NestJS).

For detailed deployment instructions, see [Deployment Guide](../docs/deployment_guide_ec2_docker.md).

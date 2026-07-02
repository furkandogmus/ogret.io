---
description: Deploy with Docker Compose
---
Build and deploy using Docker:
1. `pnpm build` (frontend)
2. `cd backend && ./gradlew build` (backend JAR)
3. `docker compose -f docker-compose.prod.yml build`
4. `docker compose -f docker-compose.prod.yml up -d`

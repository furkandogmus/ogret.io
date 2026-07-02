.PHONY: install dev build test clean db-start db-stop backend-run frontend-run \
        stop stop-backend stop-frontend \
        docker-build docker-up docker-down migrate seed lint format help

# ─── Vars ──────────────────────────────────────────────────────────
BACKEND_DIR = backend
GRADLE = cd $(BACKEND_DIR) && ./gradlew
DC = docker compose
DC_PROD = docker compose -f docker-compose.prod.yml

# ─── Default ────────────────────────────────────────────────────────
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  sort | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Install ────────────────────────────────────────────────────────
install: ## Install all dependencies (frontend + backend)
	pnpm install
	@echo "--- Backend dependencies ---"
	$(GRADLE) build --no-daemon -x test

# ─── Development ────────────────────────────────────────────────────
dev: ## Start both backend and frontend in dev mode
	$(GRADLE) bootRun &
	pnpm dev

db-start: ## Start PostgreSQL and Redis via Docker
	$(DC) up -d postgres redis
	@echo "PostgreSQL :5432  Redis :6379"

db-stop: ## Stop PostgreSQL and Redis
	$(DC) stop postgres redis

db-reset: ## Reset and recreate dev database
	$(DC) rm -sf postgres redis
	$(DC) up -d postgres redis
	@echo "Waiting for PostgreSQL..."
	@sleep 3
	$(GRADLE) flywayRepair flywayMigrate --no-daemon

backend-run: ## Run backend with Gradle
	$(GRADLE) bootRun --no-daemon

frontend-run: ## Run frontend dev server
	pnpm dev

stop: ## Stop both backend and frontend dev servers
	@echo "Port 8080 üzerindeki Backend servisi durduruluyor..."
	@lsof -t -i :8080 | xargs kill -9 2>/dev/null || echo "Backend servisi zaten çalışmıyor."
	@echo "Port 5173 üzerindeki Frontend servisi durduruluyor..."
	@lsof -t -i :5173 | xargs kill -9 2>/dev/null || echo "Frontend servisi zaten çalışmıyor."

stop-backend: ## Stop only the backend dev server
	@echo "Port 8080 üzerindeki Backend servisi durduruluyor..."
	@lsof -t -i :8080 | xargs kill -9 2>/dev/null || echo "Backend servisi zaten çalışmıyor."

stop-frontend: ## Stop only the frontend dev server
	@echo "Port 5173 üzerindeki Frontend servisi durduruluyor..."
	@lsof -t -i :5173 | xargs kill -9 2>/dev/null || echo "Frontend servisi zaten çalışmıyor."

# ─── Build ──────────────────────────────────────────────────────────
build: ## Build frontend + backend (without tests)
	@echo "--- Building frontend ---"
	pnpm build
	@echo "--- Building backend ---"
	$(GRADLE) build --no-daemon -x test

build-frontend: ## Build frontend only
	pnpm build

build-backend: ## Build backend only
	$(GRADLE) build --no-daemon -x test

# ─── Test ───────────────────────────────────────────────────────────
test: ## Run all tests
	@echo "--- Backend tests ---"
	$(GRADLE) test --no-daemon
	@echo "--- Frontend E2E tests ---"
	pnpm test:e2e

test-backend: ## Run backend tests only
	$(GRADLE) test --no-daemon

test-frontend: ## Run frontend E2E tests only
	pnpm test:e2e

test-frontend-ui: ## Run frontend E2E tests with Playwright UI
	pnpm test:e2e:ui

# ─── Docker ─────────────────────────────────────────────────────────
docker-build: ## Build Docker images for frontend
	$(DC) build frontend

docker-up: ## Start full dev stack via Docker Compose
	$(DC) up -d --build

docker-down: ## Stop and remove containers
	$(DC) down

docker-logs: ## Tail logs from all containers
	$(DC) logs -f

docker-prod-build: ## Build production Docker images
	$(DC_PROD) build

docker-prod-up: ## Start production stack
	$(DC_PROD) up -d

docker-prod-down: ## Stop production stack
	$(DC_PROD) down

# ─── Database Migrations ────────────────────────────────────────────
migrate: ## Create a new Flyway migration (usage: make migrate NAME=my_description)
	@if [ -z "$(NAME)" ]; then \
	  echo "Usage: make migrate NAME=description"; \
	  exit 1; \
	fi
	@TIMESTAMP=$$(date +%Y%m%d%H%M%S); \
	FILE="$(BACKEND_DIR)/src/main/resources/db/migration/V$${TIMESTAMP}__$(NAME).sql"; \
	touch "$$FILE"; \
	echo "Created: $$FILE"

migrate-run: ## Run pending Flyway migrations
	$(GRADLE) flywayMigrate --no-daemon

# ─── Seed ───────────────────────────────────────────────────────────
seed: ## Seed development database (runs AppSeeder via dev profile)
	SPRING_PROFILES_ACTIVE=dev $(GRADLE) bootRun --no-daemon --args='--seed-only'

# ─── Clean ──────────────────────────────────────────────────────────
clean: ## Remove all build artifacts
	rm -rf dist/
	$(GRADLE) clean --no-daemon
	rm -rf node_modules/
	@echo "Done. Run 'make install' to reinstall."

clean-docker: ## Remove Docker volumes (⚠️ deletes data)
	$(DC) down -v

# ─── Lint / Format ──────────────────────────────────────────────────
lint: ## Lint frontend code (ESLint, warnings only — does NOT block build)
	pnpm lint

lint-fix: ## Auto-fix lint issues
	pnpm lint:fix

typecheck: ## Run TypeScript type checking (does NOT block build)
	pnpm typecheck

check: lint typecheck ## Run all static analysis (lint + typecheck)

# ─── Git ────────────────────────────────────────────────────────────
pr: ## Create a GitHub PR (requires gh CLI)
	@if ! command -v gh &> /dev/null; then \
	  echo "gh CLI not found. Install: brew install gh"; \
	  exit 1; \
	fi
	gh pr create --web

# ─── Ops ────────────────────────────────────────────────────────────
status: ## Show status of all services
	@echo "--- Docker ---"
	$(DC) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "--- Git ---"
	git log --oneline -5

# ─── Help (default) ─────────────────────────────────────────────────
.DEFAULT_GOAL := help

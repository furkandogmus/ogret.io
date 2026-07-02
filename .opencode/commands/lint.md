Lint command: Run ESLint and TypeScript type checking.

Usage: 
- `make lint` — ESLint (warnings only, does NOT block build)
- `make lint-fix` — ESLint with auto-fix
- `make typecheck` — TypeScript type checking
- `make check` — Both lint + typecheck

Rules are in eslint.config.js (flat config). Errors for real bugs, warnings for style.

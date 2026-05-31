.PHONY: up-backend up-frontend test lint-backend lint-frontend

up-backend:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload

up-frontend:
	cd frontend && npm run dev

test:
	cd backend && pytest

lint-backend:
	cd backend && pylint app || true

lint-frontend:
	cd frontend && npm run lint

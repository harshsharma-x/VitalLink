# Contributing to VitalLink

Thanks for your interest in contributing! 🩸

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/vitallink.git
   cd vitallink
   ```
3. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m ml.train_model  # Train ML models
   python main.py            # Start API server
   ```
4. Set up the mobile app:
   ```bash
   cd mobile/vitallink-app
   npm install
   npx expo start
   ```

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints for all function signatures
- Use descriptive variable names
- Write docstrings for public functions

### TypeScript (Frontend)
- Use strict TypeScript mode
- Avoid `any` types where possible
- Define proper navigation types
- Use React Navigation's type-safe patterns

## Pull Request Process

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make your changes and commit with descriptive messages
3. Run tests:
   ```bash
   cd backend && python -m pytest tests/ -v
   ```
4. Push and open a PR
5. Ensure CI checks pass

## Commit Messages

Use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `docs:` — documentation only
- `test:` — adding or updating tests
- `chore:` — maintenance tasks

## Questions?

Open a GitHub issue or reach out to the maintainers.

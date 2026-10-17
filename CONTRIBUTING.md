# Contributing to ResQNet

Thank you for your interest in contributing to **ResQNet**! We welcome bug reports, feature suggestions, documentation enhancements, and code contributions to make disaster coordination safer and more effective.

---

## 🛠️ Code of Conduct

We are dedicated to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and constructive in all discussions, pull requests, and issue comments.

---

## 🌿 Git Workflow & Branches

1. **Fork the Repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/ResQnet.git
   cd ResQnet
   ```
3. **Create a topic branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
4. **Make incremental, clean commits** following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(scope): add feature`
   - `fix(scope): resolve bug`
   - `docs(scope): update documentation`
   - `refactor(scope): improve structure`
   - `test(scope): add or update test suites`

---

## 💻 Local Development Guidelines

### Frontend
- All frontend code resides in `frontend/`.
- Written in **React 19 + TypeScript + Tailwind CSS**.
- Follow strict typing: avoid `any` where explicit types or interfaces can be declared in `src/types/index.ts`.
- Ensure production build passes before submitting:
  ```bash
  cd frontend
  npm run build
  ```

### Backend
- All backend services reside in `backend/`.
- Written in **Node.js + Express**.
- Test routes and models for backward compatibility.
- Ensure the server starts cleanly:
  ```bash
  cd backend
  npm run dev
  ```

---

## 📬 Submitting Pull Requests

1. Rebase your branch against the latest `main` branch before opening a PR.
2. Provide a clear description of the problem solved and changes introduced.
3. Link relevant issue tickets if applicable.
4. Verify that linting and builds succeed with zero warnings or errors.

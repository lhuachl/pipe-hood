# Contributing to own-orm

Thank you for your interest in contributing to own-orm! We welcome contributions from everyone.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/joshuavillegas/own-orm.git
   cd own-orm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run examples to verify setup**
   ```bash
   npm run verify
   npm run example:connection
   ```

## Development Workflow

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier conventions
- Maintain strict type checking (`strict: true` in tsconfig.json)
- Write clear, descriptive variable names

### Commit Messages

- Use descriptive commit messages
- Reference issues when applicable
- Follow conventional commits format:
  ```
  feat: add new feature
  fix: fix a bug
  docs: update documentation
  refactor: improve code quality
  test: add or update tests
  ```

### Testing

- Test your changes with existing examples:
  ```bash
  npm run example:complete
  npm run example:async
  ```

### Building

Before submitting a PR, ensure the code compiles:
```bash
npm run build
```

## Architecture Guidelines

When adding new features, follow these principles:

1. **Dependency Injection**: Inject dependencies via constructor
2. **Interface Segregation**: Create focused, minimal interfaces
3. **Single Responsibility**: Each class should have one reason to change
4. **Fail-First**: Validate inputs immediately and throw clear errors

### Adding a New Executor

```typescript
import { IExecutor } from '../types/index.js';

export class CustomExecutor implements IExecutor {
  async execute(sql: string, params: unknown[]): Promise<unknown[]> {
    // Your implementation
    return results;
  }
}
```

### Adding a New Compiler

```typescript
import { ICompiler, QueryState } from '../types/index.js';

export class CustomCompiler implements ICompiler {
  compile(state: QueryState): { sql: string; params: unknown[] } {
    // Your implementation
    return { sql, params };
  }
}
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit them
3. Push to your fork: `git push origin feature/your-feature`
4. Create a Pull Request with a clear description
5. Ensure all checks pass
6. Wait for review and feedback

## Reporting Bugs

When reporting bugs, please include:

- **Description**: Clear explanation of the bug
- **Steps to reproduce**: How to trigger the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Node version, OS, package versions
- **Code sample**: Minimal reproducible example

## Feature Requests

Feature requests are welcome! Please describe:

- **Use case**: Why this feature is needed
- **Proposed solution**: How it might work
- **Alternatives**: Any alternative approaches considered

## Questions?

- Open an issue for questions or discussions
- Tag your issue appropriately
- Be respectful and constructive

## Code of Conduct

- Be respectful and inclusive
- Constructive feedback only
- No harassment or discrimination
- Respect intellectual property

Thank you for contributing to own-orm!

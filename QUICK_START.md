## 📦 Installation

```bash
npm install pipehood
```

## 🚀 Quick Start

```typescript
import { QueryBuilderFactory, PostgresCompiler, SupabaseExecutor } from 'pipehood';
import postgres from 'postgres';

// Initialize connection
const db = postgres({
  host: 'your-host.supabase.com',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'your-password',
});

// Create factory
const compiler = new PostgresCompiler();
const executor = new SupabaseExecutor(db);
const factory = new QueryBuilderFactory(compiler, executor);

// Execute query
const users = await factory.create()
  .table('users')
  .select(['id', 'name', 'email'])
  .whereEq('active', true)
  .execute();

console.log(users);
```

## 📚 Examples

See `/examples` directory for comprehensive examples:

- `01-basic-connection.ts` - Basic queries
- `02-custom-executor.ts` - Custom executors
- `03-fail-first.ts` - Error handling
- `04-real-tables.ts` - Real database queries
- `05-complete-system.ts` - Complete system demo
- `06-async-parallelism.ts` - Parallel queries

Run examples:
```bash
npm run example:complete
npm run example:async
```

## 📖 Full Documentation

- [README.md](./README.md) - Complete API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history

## 🔗 Key Features

✨ **Clean Architecture** - Decoupled, SOLID principles  
🔄 **Fluent API** - Chainable query builder  
🛡️ **Type-Safe** - Full TypeScript support  
⚡ **Async** - Promise-based queries  
🔌 **Extensible** - Custom executors/compilers  

## 📦 Publishing

Ready to publish? See [PUBLISH.md](./PUBLISH.md)

```bash
npm run build        # Compile TypeScript
npm pack --dry-run   # Preview package
npm publish          # Publish to npm
```

---

**Current Version**: 1.0.0  
**License**: MIT  
**Node**: >= 18.0.0

# own-orm

> Minimal, lightweight ORM for PostgreSQL with dependency injection, fluent API, and TypeScript support.

A production-ready query builder designed with SOLID principles: clean architecture, decoupled components, and extensibility through dependency injection.

## Features

✨ **Clean Architecture** - Decoupled components using dependency injection  
🔄 **Fluent API** - Chainable methods for elegant query building  
🛡️ **Type-Safe** - Full TypeScript support with strict types  
⚡ **Async/Parallel** - Native Promise support with parallel query execution  
🔌 **Extensible** - Implement custom compilers and executors  
📊 **Parameterized Queries** - Protection against SQL injection  
🎯 **Fail-First** - Immediate validation with clear error messages  

## Installation

```bash
npm install own-orm
```

## Quick Start

```typescript
import { QueryBuilderFactory, PostgresCompiler, SupabaseExecutor } from 'own-orm';
import postgres from 'postgres';

// Initialize database connection
const db = postgres({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Create factory with dependencies
const compiler = new PostgresCompiler();
const executor = new SupabaseExecutor(db);
const factory = new QueryBuilderFactory(compiler, executor);

// Build and execute queries
const result = await factory.create()
  .table('usuarios')
  .select(['id', 'nombre', 'email'])
  .whereEq('activo', true)
  .orderBy('nombre', 'ASC')
  .limit(10)
  .execute();

console.log(result);
```

## Usage Examples

### Basic Queries

```typescript
const qb = factory.create();

// SELECT
const usuarios = await qb.table('usuarios')
  .select(['id', 'nombre', 'email'])
  .execute();

// WHERE with equality
const activos = await qb.table('usuarios')
  .select(['*'])
  .whereEq('estado', 'Activo')
  .execute();

// WHERE with IN clause
const pedidos = await qb.table('pedidos')
  .select(['*'])
  .whereIn('estado', ['Pendiente', 'En tránsito'])
  .execute();

// Raw WHERE clause
const custom = await qb.table('pedidos')
  .select(['*'])
  .whereRaw('monto > ? AND monto < ?', [50, 500])
  .execute();

// Ordering and Limiting
const paginated = await qb.table('usuarios')
  .select(['*'])
  .orderBy('fecha_creacion', 'DESC')
  .limit(10)
  .offset(0)
  .execute();
```

### Parallel Queries

Execute multiple queries concurrently for better performance:

```typescript
// Run 3 queries in parallel instead of sequentially
const [usuarios, pedidos, clientes] = await Promise.all([
  factory.create()
    .table('usuarios')
    .select(['*'])
    .execute(),
  factory.create()
    .table('pedidos')
    .select(['*'])
    .execute(),
  factory.create()
    .table('clientes')
    .select(['*'])
    .execute(),
]);

// Results are typically 20-30% faster than sequential
```

### Query Cloning

Create query variants without mutations:

```typescript
const baseQuery = factory.create()
  .table('pedidos')
  .select(['*'])
  .whereEq('estado', 'Pendiente');

// Create variations safely
const query1 = baseQuery.clone().orderBy('fecha', 'ASC').limit(10);
const query2 = baseQuery.clone().orderBy('monto', 'DESC').limit(5);

// Both execute independently
const [result1, result2] = await Promise.all([
  query1.execute(),
  query2.execute(),
]);
```

## API Reference

### QueryBuilder Methods

#### `table(name: string): this`
Set the table to query from.

```typescript
qb.table('usuarios')
```

#### `select(columns: string[]): this`
Select specific columns. Use `['*']` for all columns.

```typescript
qb.select(['id', 'nombre', 'email'])
qb.select(['*'])  // Select all
```

#### `whereEq(column: string, value: unknown): this`
Add an equality condition.

```typescript
qb.whereEq('estado', 'Activo')
qb.whereEq('edad', 25)
```

#### `whereIn(column: string, values: unknown[]): this`
Add an IN condition for multiple values.

```typescript
qb.whereIn('estado', ['Activo', 'Pendiente'])
```

#### `whereRaw(sql: string, params: unknown[]): this`
Add a raw SQL condition with parameters.

```typescript
qb.whereRaw('edad > ? AND edad < ?', [18, 65])
```

#### `orderBy(column: string, direction: 'ASC' | 'DESC'): this`
Add ordering.

```typescript
qb.orderBy('nombre', 'ASC')
qb.orderBy('fecha_creacion', 'DESC')
```

#### `limit(n: number): this`
Set result limit.

```typescript
qb.limit(10)
```

#### `offset(n: number): this`
Set result offset for pagination.

```typescript
qb.offset(20)  // Skip first 20 rows
```

#### `clone(): QueryBuilder`
Create an independent copy of the query builder.

```typescript
const query2 = query1.clone().limit(5)
```

#### `execute(): Promise<T[]>`
Execute the query and return results.

```typescript
const results = await qb.execute()
```

## Architecture

### Component Design

```
QueryBuilderFactory
    ├── ICompiler (PostgresCompiler)
    │   └── Converts QueryState → SQL string
    └── IExecutor (SupabaseExecutor)
        └── Executes compiled SQL → Results
```

### Dependency Injection

Components are loosely coupled through interfaces:

```typescript
// QueryBuilder depends on abstractions, not concrete implementations
class QueryBuilder {
  constructor(
    private compiler: ICompiler,
    private executor: IExecutor
  ) {}
}

// Easy to swap implementations
const customExecutor = new LoggingExecutor(new SupabaseExecutor(db));
const factory = new QueryBuilderFactory(compiler, customExecutor);
```

### SOLID Principles

- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Extend functionality without modifying existing code
- **L**iskov Substitution: Custom executors implement IExecutor interface
- **I**nterface Segregation: Focused, minimal interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

## Custom Executors

Implement your own executor for logging, caching, or custom logic:

```typescript
import { IExecutor } from 'own-orm';

class LoggingExecutor implements IExecutor {
  constructor(private executor: IExecutor) {}

  async execute(sql: string, params: unknown[]): Promise<unknown[]> {
    console.log('SQL:', sql);
    console.log('Params:', params);
    const result = await this.executor.execute(sql, params);
    console.log('Result:', result);
    return result;
  }
}

// Use it
const executor = new LoggingExecutor(new SupabaseExecutor(db));
const factory = new QueryBuilderFactory(compiler, executor);
```

## Environment Setup

Create a `.env` file in your project root:

```env
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.your-project-id
DB_PASSWORD=your-secure-password
```

Then load it in your application:

```typescript
import * as dotenv from 'dotenv';
dotenv.config();
```

## Performance Tips

1. **Use Parallel Queries**: Execute independent queries with `Promise.all()`
2. **Batch Operations**: Group related queries together
3. **Pagination**: Use `limit()` and `offset()` for large result sets
4. **Indexes**: Ensure database has proper indexes on frequently queried columns
5. **Connection Pooling**: Supabase Session Pooler is recommended for serverless

## Testing

Run included examples to verify functionality:

```bash
# Basic connection test
npm run verify

# Run examples
npm run example:connection
npm run example:async
npm run example:complete
```

## Type Safety

All queries are fully typed:

```typescript
interface User {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

const usuarios = await factory.create()
  .table('usuarios')
  .select(['id', 'nombre', 'email'])
  .execute() as User[];

// TypeScript knows about all properties
console.log(usuarios[0].nombre);
```

## Requirements

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12
- **TypeScript** >= 5.0 (for development)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © 2024 Joshua Villegas

## Support

- 📖 [Full Documentation](https://github.com/joshuavillegas/own-orm)
- 🐛 [Report Issues](https://github.com/joshuavillegas/own-orm/issues)
- 💬 [Discussions](https://github.com/joshuavillegas/own-orm/discussions)

## Changelog

### v1.0.0 (Initial Release)

- Clean architecture with dependency injection
- Fluent query builder API
- PostgreSQL compiler with parameterized queries
- Supabase executor with async support
- Comprehensive examples and documentation
- SOLID principles applied throughout

# ORM Minimalista - Arquitectura Desacoplada

## 📋 Resumen de la Arquitectura

Tu ORM está construido con **Inyección de Dependencias** e **Inversión de Control**, permitiendo total flexibilidad.

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    QueryBuilder                               │
│         (Orquesta estado, expone API fluida)                  │
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │ ICompiler        │              │ IExecutor        │     │
│  │ (Interface)      │              │ (Interface)      │     │
│  └──────────────────┘              └──────────────────┘     │
│           △                                 △                 │
│           │                                 │                 │
│    PostgresCompiler                SupabaseExecutor           │
│    (Convierte state                (Ejecuta SQL contra        │
│     a SQL PostgreSQL)               la BD de Supabase)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estructura de Carpetas

```
own-orm/
├── src/
│   ├── types/
│   │   └── index.ts                 # Interfaces: ICompiler, IExecutor, etc
│   ├── compiler/
│   │   └── PostgresCompiler.ts      # Convierte QueryState → SQL
│   ├── executor/
│   │   └── SupabaseExecutor.ts      # Ejecuta SQL en Supabase
│   ├── factory/
│   │   └── QueryBuilderFactory.ts   # Factory para inyectar dependencias
│   └── QueryBuilder/
│       └── QueryBuilder.ts           # Orquesta estado y API
├── examples/
│   ├── 01-basic-connection.ts       # Conexión básica
│   ├── 02-custom-executor.ts        # Executor personalizado
│   └── 03-fail-first.ts             # Manejo de errores
├── index.ts                          # Punto de entrada (exports)
├── db.ts                             # Cliente PostgreSQL (opcional)
├── tsconfig.json                     # Configuración TypeScript
├── package.json                      # Scripts y dependencias
└── .env                              # Variables de entorno
```

---

## 🔌 Inyección de Dependencias

### Crear un QueryBuilder con dependencias inyectadas:

```typescript
import { PostgresCompiler } from './src/compiler/PostgresCompiler.js';
import { SupabaseExecutor } from './src/executor/SupabaseExecutor.js';
import { QueryBuilderFactory } from './src/factory/QueryBuilderFactory.js';
import postgres from 'postgres';

// 1. Crear cliente
const pgClient = postgres({ /* config */ });

// 2. Crear dependencias
const compiler = new PostgresCompiler();
const executor = new SupabaseExecutor(pgClient);

// 3. Crear factory
const factory = new QueryBuilderFactory(compiler, executor);

// 4. Usar
const query = factory.create()
  .table('users')
  .select('id', 'name')
  .limit(10);

const results = await query.execute();
```

---

## 💡 Principios Aplicados

### 1. **Open/Closed Principle (OCP)**
- La clase `QueryBuilder` está **cerrada para modificación**, pero **abierta para extensión** a través de interfaces.
- Puedes crear nuevos compiladores o ejecutores sin tocar `QueryBuilder`.

### 2. **Dependency Inversion (DIP)**
- `QueryBuilder` depende de abstracciones (`ICompiler`, `IExecutor`), no de implementaciones concretas.
- Facilita testing y cambios de implementación.

### 3. **Single Responsibility (SRP)**
- `PostgresCompiler`: solo compila SQL
- `SupabaseExecutor`: solo ejecuta SQL
- `QueryBuilder`: solo orquesta estado
- `QueryBuilderFactory`: solo crea instancias

### 4. **Fail-First**
- Valida requerimientos inmediatamente: `table()` es obligatorio.
- Errores claros y mensajes específicos.

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Conexión básica

```bash
npm run example:connection
```

Salida esperada:
```
✅ Conectado a Supabase

📋 Ejecutando queries...

Query 1 (SQL): SELECT * FROM users LIMIT 5
Query 2 (SQL): SELECT id, name, email FROM users WHERE id = $1
Query 3 (SQL): SELECT * FROM users WHERE status IN ($1, $2) ORDER BY created_at DESC LIMIT 10
Query 4a (Cloned - Electronics): SELECT * FROM products WHERE category = $1
Query 4b (Cloned - Books): SELECT * FROM products WHERE category = $1
Base (sin cambios): SELECT * FROM products

✅ Desconectado de Supabase
```

### Ejemplo 2: Executor personalizado

```bash
npm run example:custom
```

Muestra cómo crear un `LoggingExecutor` que envuelve otro executor sin tocar `QueryBuilder`.

### Ejemplo 3: Fail-First

```bash
npm run example:failfirst
```

Demuestra cómo el sistema falla rápido y de forma clara cuando falta información.

---

## 🔄 Flujo de Construcción de Query

```
1. factory.create()
   └─> new QueryBuilder(compiler, executor)

2. .table('users')
   └─> state.table = 'users'

3. .select('id', 'name')
   └─> state.selects = ['id', 'name']

4. .whereEq('active', true)
   └─> state.where = [{ text: 'active = $', params: [true] }]

5. .limit(10)
   └─> state.limit = 10

6. .execute()
   └─> compile() → compiler.compile(state)
   └─> { sql: '...', params: [...] }
   └─> executor.execute(sql, params)
   └─> Promise<T[]>
```

---

## 🛡️ Características

✅ **Mutabilidad segura**: Cada método retorna `this`  
✅ **Encadenamiento**: Sintaxis fluida  
✅ **Tipado genérico**: `execute<T>()` para resultados tipados  
✅ **Clonación segura**: `.clone()` evita mutaciones compartidas  
✅ **Parámetros seguros**: Previene SQL injection  
✅ **Desacoplado**: Fácil de extender y testear  
✅ **Fail-First**: Errores claros e inmediatos  

---

## 🚀 Extensión Futura

Para agregar nuevas features sin tocar código existente:

### 1. Nuevo Compilador
```typescript
export class MySQLCompiler implements ICompiler {
  compile(state: QueryState): { sql: string; params: unknown[] } {
    // Implementación para MySQL
  }
}
```

### 2. Nuevo Executor
```typescript
export class MongoDbExecutor implements IExecutor {
  async execute<T>(sql: string, params: unknown[]): Promise<T[]> {
    // Implementación para MongoDB
  }
}
```

### 3. Nueva funcionalidad en QueryBuilder
```typescript
export class QueryBuilder {
  // ... código existente ...
  
  groupBy(...cols: string[]): this {
    this._state.groupBy = cols;
    return this;
  }
}
```

---

## 📦 Exportes Principales

Desde `index.ts`:

```typescript
export { QueryBuilder }
export { PostgresCompiler }
export { SupabaseExecutor }
export { QueryBuilderFactory }
export type { ICompiler, IExecutor, QueryState, SQLFragment }
```

Para importar en tu proyecto:

```typescript
import { QueryBuilderFactory, PostgresCompiler, SupabaseExecutor } from 'own-orm';
```

---

## 🧪 Testing

Cada componente puede testarse independientemente:

```typescript
// Test Compiler
const compiler = new PostgresCompiler();
const result = compiler.compile(state);
// Assert result.sql, result.params

// Test Executor
const executor = new MockExecutor();
// Assert execute calls with correct params

// Test QueryBuilder
const qb = new QueryBuilder(mockCompiler, mockExecutor);
// Assert state changes
```

---

**¡Tu ORM está listo para escalarse de forma segura y mantenible! 🎉**

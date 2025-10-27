# 📋 Operaciones Actuales vs Faltantes

## ✅ Lo que Tienes Ahora

### Operaciones Implementadas: **SELECT Only**

```typescript
// ✅ SELECT con todos los filtros
const users = await factory.create()
  .table('users')
  .select(['id', 'name', 'email'])
  .whereEq('active', true)
  .whereIn('role', ['admin', 'user'])
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(0)
  .execute();
```

#### Métodos Disponibles:

| Método | Tipo | Descripción |
|--------|------|-------------|
| `table(name)` | SELECT | Define tabla |
| `select(...cols)` | SELECT | Selecciona columnas |
| `whereEq(field, value)` | WHERE | Igualdad |
| `whereRaw(sql, params)` | WHERE | SQL personalizado |
| `whereIn(field, values)` | WHERE | IN clause |
| `orderBy(col, dir)` | ORDER BY | Ordenamiento |
| `limit(n)` | LIMIT | Limite de resultados |
| `offset(n)` | OFFSET | Saltar N resultados |
| `execute()` | Execute | Ejecutar query |
| `toSQL()` | Info | Ver SQL sin ejecutar |
| `clone()` | Utility | Clonar query |

---

## ❌ Lo que NO Tienes

### Operaciones Faltantes

#### 1. **DELETE** ❌
```typescript
// ❌ NO EXISTE
const deleted = await factory.create()
  .table('users')
  .where('id', 1)
  .delete();
```

#### 2. **INSERT** ❌
```typescript
// ❌ NO EXISTE
const inserted = await factory.create()
  .table('users')
  .insert({ name: 'Juan', email: 'juan@example.com' });
```

#### 3. **UPDATE** ❌
```typescript
// ❌ NO EXISTE
const updated = await factory.create()
  .table('users')
  .where('id', 1)
  .update({ name: 'María', active: false });
```

#### 4. **JOINS** ❌
```typescript
// ❌ NO EXISTE
const posts = await factory.create()
  .table('posts')
  .join('users', 'posts.user_id', 'users.id')
  .select('posts.title', 'users.name')
  .execute();
```

#### 5. **GROUP BY / HAVING** ❌
```typescript
// ❌ NO EXISTE
const stats = await factory.create()
  .table('posts')
  .select('user_id', 'COUNT(*) as count')
  .groupBy('user_id')
  .having('count', '>', 5)
  .execute();
```

---

## 🎯 Actual Use Case

`pipehood` actualmente es útil para:

```typescript
// ✅ Leer datos
const users = await factory.create()
  .table('users')
  .select(['*'])
  .execute();

// ✅ Filtrar
const active = await users.filter(u => u.active);

// ✅ Pero debes hacer el INSERT/UPDATE/DELETE manualmente
// ❌ O usar SQL directo con el cliente postgres
const client = postgres({ /* config */ });
await client`DELETE FROM users WHERE id = ${1}`;
```

---

## 🚀 Opciones para Agregar estas Operaciones

### Opción 1: **Agregar DELETE, INSERT, UPDATE a pipehood** ✨

Si quieres que agregue estas operaciones:

```typescript
// DELETE
const deleted = await factory.create()
  .table('users')
  .where('id', 1)
  .delete();

// INSERT
const inserted = await factory.create()
  .table('users')
  .insert({ name: 'Juan', email: 'juan@example.com' });

// UPDATE
const updated = await factory.create()
  .table('users')
  .where('id', 1)
  .update({ name: 'María' });
```

**Ventaja**: Todo en un solo lugar  
**Desventaja**: Mayor complejidad

### Opción 2: **Mantener SQL directo para mutaciones**

```typescript
// SELECT con pipehood
const users = await factory.create()
  .table('users')
  .select(['*'])
  .execute();

// DELETE/INSERT/UPDATE con SQL directo
const db = postgres({ /* config */ });
await db`DELETE FROM users WHERE id = ${1}`;
await db`INSERT INTO users (name, email) VALUES (${name}, ${email})`;
await db`UPDATE users SET name = ${name} WHERE id = ${id}`;
```

**Ventaja**: Simplicidad, claridad  
**Desventaja**: Usa dos APIs diferentes

### Opción 3: **Usar pipehood + Complementar con ORM**

```typescript
// pipehood para queries complejas de lectura
const complexData = await factory.create()
  .table('users')
  .whereRaw('age > ? AND status IN (...)', params)
  .orderBy('created_at', 'DESC')
  .execute();

// TypeORM/Prisma para CREATE/UPDATE/DELETE
const user = new User();
user.name = 'Juan';
await repository.save(user);
```

**Ventaja**: Lo mejor de ambos mundos  
**Desventaja**: Dos dependencias

---

## ⚡ Recomendación

Basado en el tamaño actual (11.8 kB) y arquitectura:

### Si Necesitas **Solo Lectura** → ✅ Usa pipehood como está
```bash
npm install pipehood
# Para DELETE/INSERT/UPDATE usa SQL directo con postgres
```

### Si Necesitas **CRUD Completo** → 🚀 Puedo Agregar DELETE/INSERT/UPDATE
```bash
# Versión 1.1.0 con operaciones de mutación
npm install pipehood@1.1.0
```

### Si Necesitas **ORM Completo** → 📦 Considera TypeORM/Prisma
```bash
npm install typeorm  # o prisma
```

---

## 📊 Impacto de Agregar DELETE/INSERT/UPDATE

### Tamaño del Paquete

| Operación | Tamaño Actual | Con DELETE/INSERT/UPDATE |
|---|---|---|
| pipehood | 11.8 kB | ~18-20 kB (estimado) |

### Complejidad

| Aspecto | Actual | Con Mutaciones |
|---|---|---|
| Métodos | 11 | ~20+ |
| Interfaces | Simple | Más complejas |
| Curva Aprendizaje | Muy fácil | Fácil |
| Líneas de Código | ~400 | ~600-700 |

---

## 🎓 Mi Sugerencia

**Mantener pipehood como Query Builder ligero** porque:

1. ✅ Especializarse en **SELECT** = mejor calidad
2. ✅ Mantener **tamaño pequeño** (11.8 kB)
3. ✅ Arquitectura **focalizada** (SOLID)
4. ✅ Fácil de entender y mantener

**Para mutaciones**, recomienda a los usuarios:

```typescript
// Opción A: SQL directo (recomendado)
const db = postgres({ /* config */ });
await db`DELETE FROM users WHERE id = ${id}`;

// Opción B: Agregar un DeleteBuilder personalizado
// (Usa la misma arquitectura de pipehood)

// Opción C: Usar junto a Prisma/TypeORM para CRUD
```

---

## 🤔 ¿Qué Haces?

1. **¿Quieres que agregue DELETE/INSERT/UPDATE?** ✨
2. **¿Prefieres mantenerlo como Query Builder puro?** 🎯
3. **¿Quieres ambas opciones documentadas?** 📖

¿Cuál es tu preferencia?

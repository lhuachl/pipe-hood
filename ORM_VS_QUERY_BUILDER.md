# 🤔 ¿Es un ORM o un Query Builder?

## Respuesta Honesta: **Es un Query Builder, No un ORM Completo**

---

## 📊 Comparación: Query Builder vs ORM

### Qué es un **Query Builder**

```javascript
// Query Builder → Construye SQL de forma programática
const users = await queryBuilder
  .select('*')
  .from('users')
  .where('age', '>', 18)
  .orderBy('name')
  .execute();

// Genera: SELECT * FROM users WHERE age > 18 ORDER BY name
```

✅ **Ventajas**:
- Fácil de entender
- Control explícito sobre SQL
- Rápido y ligero
- Seguro contra SQL injection (parámetros)
- Flexible

❌ **Limitaciones**:
- Debes conocer la estructura de BD
- Sin mapeo automático a objetos
- Sin relaciones automáticas
- Sin migrations
- Sin validación de datos

### Qué es un **ORM** (Object-Relational Mapping)

```typescript
// ORM → Mapea tablas a clases/entidades
@Entity()
class User {
  @PrimaryKey()
  id: number;
  
  @Column()
  name: string;
  
  @Column()
  age: number;
  
  @OneToMany(() => Post, post => post.user)
  posts: Post[];
}

const users = await User.find({ where: { age: GreaterThan(18) } });
// Obtiene User objects completos con relaciones
```

✅ **Ventajas**:
- Mapeo automático tabla → objeto
- Relaciones automáticas (OneToMany, ManyToMany)
- Validación de datos integrada
- Lifecycle hooks (beforeSave, afterDelete)
- Migrations automáticas
- Lazy loading de relaciones

❌ **Limitaciones**:
- Overhead de performance
- Curva de aprendizaje pronunciada
- Configuración compleja
- "Magic" que puede ser confuso

---

## 🎯 ¿Qué es `pipehood`?

### **Es un Query Builder Minimalista**

```typescript
// pipehood = Query Builder + Arquitectura Limpia
const usuarios = await factory.create()
  .table('usuarios')           // Necesitas saber el nombre de tabla
  .select(['id', 'nombre'])    // Necesitas saber los nombres de columna
  .whereEq('activo', true)
  .orderBy('nombre', 'ASC')
  .execute();

// Resultado: Array de objetos planos
// { id: 1, nombre: 'Juan' }
// { id: 2, nombre: 'María' }
```

### Características de `pipehood`

| Característica | ¿Lo Tiene? | Detalles |
|---|---|---|
| **Query Builder** | ✅ Sí | SELECT, WHERE, ORDER BY, LIMIT, OFFSET |
| **SQL Seguro** | ✅ Sí | Parámetros (protección contra SQL injection) |
| **API Fluida** | ✅ Sí | `.table().select().where().execute()` |
| **Inyección de Dependencias** | ✅ Sí | Compiler + Executor desacoplados |
| **Relaciones** | ❌ No | No mapeo automático de relaciones |
| **Entidades/Modelos** | ❌ No | Objetos planos, no clases tipadas |
| **Validación** | ❌ No | Sin validación integrada |
| **Migrations** | ❌ No | Sin gestión de migraciones |
| **Lazy Loading** | ❌ No | Sin carga diferida de relaciones |
| **Hooks** | ❌ No | Sin beforeSave, afterDelete, etc. |

---

## 🎯 Caso de Uso de `pipehood`

### ✅ Ideal Para:

1. **Backend simple** (APIs REST básicas)
   ```typescript
   const usuarios = await factory.create()
     .table('usuarios')
     .select(['*'])
     .execute();
   ```

2. **Queries simples** (sin relaciones complejas)
   ```typescript
   const activos = await factory.create()
     .table('usuarios')
     .whereEq('estado', 'Activo')
     .execute();
   ```

3. **Control explícito sobre SQL**
   ```typescript
   const custom = await factory.create()
     .table('usuarios')
     .whereRaw('edad > ? AND salario < ?', [25, 50000])
     .execute();
   ```

4. **Performance crítico** (sin overhead de ORM)
   ```typescript
   // Query builder es mucho más rápido que un ORM
   const result = await builder.execute(); // ⚡ Muy rápido
   ```

5. **Microservicios o funciones sin servidor** (serverless)
   ```typescript
   // Ligero, sin dependencias pesadas
   npm install pipehood postgres
   ```

### ❌ NO Ideal Para:

1. **Aplicaciones complejas con muchas relaciones**
   ```typescript
   // NO puedes hacer:
   const usuario = await User.findOne(1);
   console.log(usuario.posts);  // ❌ No funciona
   ```

2. **Validación de datos complicada**
   ```typescript
   // Debes validar manualmente
   if (!email.includes('@')) throw new Error('Email inválido');
   ```

3. **Aplicaciones que necesitan migrations**
   ```typescript
   // No hay sistema de migrations integrado
   // Debes hacer el CREATE TABLE manualmente
   ```

4. **Relaciones complejas** (OneToMany, ManyToMany automáticas)
   ```typescript
   // NO tienes esto:
   @OneToMany(() => Post, post => post.user)
   posts: Post[];
   ```

---

## 🔍 Comparación con ORMs Populares

| Característica | pipehood | TypeORM | Prisma | Sequelize |
|---|---|---|---|---|
| Tipo | Query Builder | ORM Completo | ORM Completo | ORM |
| Tamaño | 11.8 kB | 200+ kB | 300+ kB | 150+ kB |
| Curva Aprendizaje | Muy fácil | Medio | Medio | Difícil |
| Relaciones | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| Migrations | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| Validación | ❌ No | ✅ Sí | Parcial | Parcial |
| Speed | ⚡⚡⚡ Rápido | ⚡⚡ Medio | ⚡⚡ Medio | ⚡ Lento |
| TypeScript | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| Async/Await | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |

---

## 💡 Ejemplos de Uso

### ✅ Lo que SÍ puedes hacer con pipehood

```typescript
// 1. Queries simples
const users = await factory.create()
  .table('users')
  .select(['id', 'name', 'email'])
  .execute();

// 2. Filtros
const adults = await factory.create()
  .table('users')
  .whereEq('age', 18)
  .whereIn('status', ['active', 'pending'])
  .execute();

// 3. Ordenamiento y paginación
const page1 = await factory.create()
  .table('users')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(0)
  .execute();

// 4. Raw SQL personalizado
const custom = await factory.create()
  .table('users')
  .whereRaw('age > ? AND salary < ?', [25, 50000])
  .execute();

// 5. Queries paralelas (eficientes)
const [users, posts, comments] = await Promise.all([
  factory.create().table('users').execute(),
  factory.create().table('posts').execute(),
  factory.create().table('comments').execute(),
]);
```

### ❌ Lo que NO puedes hacer con pipehood

```typescript
// NO relaciones automáticas
const user = await factory.create()
  .table('users')
  .execute();
console.log(user.posts); // ❌ undefined

// NO validación integrada
const user = { name: '', email: 'invalid' };
// ❌ No hay validación automática

// NO lazy loading
const posts = user.posts; // ❌ No existe este concepto

// NO migrations automáticas
// ❌ Debes crear tablas manualmente en SQL

// NO hooks de ciclo de vida
// ❌ Sin beforeSave, afterDelete, etc.
```

---

## 🎓 Conclusión

### `pipehood` es:

```
┌────────────────────────────────┐
│    QUERY BUILDER LIGERO        │
├────────────────────────────────┤
│ + Inyección de Dependencias    │
│ + API Fluida y Elegante        │
│ + SQL Seguro (Parametrizado)   │
│ + Muy Rápido                   │
│ - Sin Relaciones               │
│ - Sin Migrations               │
│ - Sin Validación               │
│ - Sin Mapeo a Objetos          │
└────────────────────────────────┘
```

### Ideal Para:

✅ APIs REST simples  
✅ Microservicios  
✅ Serverless/Lambda  
✅ Scripts de migración  
✅ Prototipos rápidos  
✅ Cuando necesitas control explícito  

### No Para:

❌ Aplicaciones Enterprise complejas  
❌ Si necesitas relaciones automáticas  
❌ Si necesitas migrations integradas  
❌ Si quieres "todo automático"  

---

## 🚀 Si Necesitas Más Funcionalidad...

Puedes:

1. **Usar pipehood + TypeORM juntos**
   ```typescript
   // TypeORM para relaciones complejas
   // pipehood para queries rápidas
   ```

2. **Migrar a un ORM completo**
   ```bash
   npm uninstall pipehood
   npm install typeorm  # o prisma, o sequelize
   ```

3. **Extender pipehood** (crear tu propio ORM)
   ```typescript
   // Basarte en pipehood para agregar relaciones
   // (Está diseñado para ser extensible)
   ```

---

**Resumen Final**: `pipehood` es un **Query Builder Minimalista** con arquitectura limpia, perfecto para casos simples. Si necesitas más, considera un ORM completo. 🎯

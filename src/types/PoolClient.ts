// Helpers para integración con 'pg' (Postgres) y Supabase session pooler
// - define PoolClient como tipo de 'pg'
// - createPgExec: factory que retorna ExecFn compatible con QueryBuilder.execute
// - PreparedStatementCache: cache por-connection (WeakMap) con LRU simple
// - withTransaction: helper para transacciones con pool.connect()

import type { Pool, PoolClient as PgPoolClient, QueryResult } from 'pg';
import type { ExecFn } from './ExecFn.js';// ajusta la ruta si es necesario

// Si usas 'pg', el tipo correcto es este:
export type PoolClient = PgPoolClient;

// Nota importante sobre Supabase (pgbouncer / session pooler):
// - Si tu Supabase está usando PgBouncer en "transaction pooling" (modo por defecto para
//   muchos deploys), los prepared statements con nombre no sobreviven entre transacciones/conexiones,
//   por lo que nombrarlos no aporta realmente caching y puede incluso fallar.
// - Recomendación: con pooler en modo transaction pooling, DESHABILITA el uso de named prepared statements.
//   Sigue usando queries parametrizados ($1..$n) (la BD hará caching de planes cuando sea posible).
// - Si gestionas conexiones dedicadas (pooler en session pooling o conexión directa), los named prepared
//   statements sí pueden ayudar y el PreparedStatementCache por cliente es útil.

export function createPgExec(client: PoolClient, opts?: { disablePrepared?: boolean }): ExecFn {
  const disablePrepared = !!opts?.disablePrepared;
  return async function exec<T = any>(sql: string, params: unknown[], execOpts?: { name?: string; signal?: AbortSignal }): Promise<T[]> {
    // build query config for node-postgres
    const q: any = {
      text: sql,
      values: params
    };

    // Only attach name if prepared statements are enabled and a name is provided.
    if (!disablePrepared && execOpts?.name) {
      q.name = execOpts.name;
    }

    // Note: node-postgres does not accept AbortSignal directly in client.query (as of older versions).
    // You can implement timeouts via 'statement_timeout' session param or use pg.cancel via a separate connection.
    const result: QueryResult = await client.query(q);
    return result.rows as T[];
  };
}

// PreparedStatementCache: WeakMap<Client, Map<shapeKey, name>>
// Useful only when you are NOT behind a transaction-pooling pooler (i.e., prepared statements survive).
export class PreparedStatementCache {
  private map: WeakMap<object, Map<string, string>> = new WeakMap();
  private maxPerClient: number;

  constructor(maxPerClient = 256) {
    this.maxPerClient = maxPerClient;
  }

  get(client: PoolClient, shapeKey: string): string | undefined {
    const m = this.map.get(client);
    return m?.get(shapeKey);
  }

  set(client: PoolClient, shapeKey: string, name: string) {
    let m = this.map.get(client);
    if (!m) {
      m = new Map();
      this.map.set(client, m);
    }
    if (m.size >= this.maxPerClient) {
      // naive LRU: drop first inserted
      const first = m.keys().next();
      if (!first.done) m.delete(first.value);
    }
    m.set(shapeKey, name);
  }

  // Convenience: execute using client and optionally name the statement the first time.
  // execFn should be createPgExec(client) typically.
  async exec<T = any>(client: PoolClient, sql: string, params: unknown[], shapeKey: string, execFn: ExecFn<T>): Promise<T[]> {
    const cached = this.get(client, shapeKey);
    if (cached) {
      return execFn(sql, params, { name: cached });
    }
    // create a stable name (includes timestamp to avoid collisions)
    const name = `stmt_${shapeKey}_${Date.now().toString(36)}`;
    this.set(client, shapeKey, name);
    return execFn(sql, params, { name });
  }
}

// withTransaction: helper que gestiona BEGIN / COMMIT / ROLLBACK y libera el cliente
export async function withTransaction<T = any>(pool: Pool, cb: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await cb(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw err;
  } finally {
    client.release();
  }
}

/*
Usage examples:

import { Pool } from 'pg';
import { QueryBuilder } from './QueryBuilder';
import { createPgExec, PreparedStatementCache, withTransaction } from './pgClientHelpers';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Simple single-query execution (no named prepared statements; safe for pgbouncer transaction pooling)
const client = await pool.connect();
try {
  const exec = createPgExec(client, { disablePrepared: true }); // disablePrepared true for Supabase pooler
  const qb = new QueryBuilder().table('users u').select('u.id','u.email').whereEq('u.active', true).limit(10);
  const rows = await qb.execute(exec);
} finally {
  client.release();
}

// Using withTransaction
await withTransaction(pool, async (client) => {
  const exec = createPgExec(client, { disablePrepared: false }); // if you control pooling mode and want prepared
  // run multiple queries within the same transaction using the same client
  const qb = new QueryBuilder().table('orders o').select('o.*').whereEq('o.user_id', 42);
  const rows = await qb.execute(exec);
  // ...
});

// PreparedStatementCache (only useful without transaction-pooling)
const psCache = new PreparedStatementCache(512);
const client2 = await pool.connect();
const exec = createPgExec(client2, { disablePrepared: false });
const qb2 = new QueryBuilder().table('events').select('*').whereEq('type','login');
const { sql, params, shapeKey } = qb2.compile();
// prefer: psCache.exec(client2, sql, params, shapeKey, exec)
const rowsCached = await psCache.exec(client2, sql, params, shapeKey, exec);
client2.release();

Notes about cancellation & timeouts:
- Pg driver (node-postgres) historically doesn't accept AbortSignal on client.query; to implement cancellation you can:
  - Use statement_timeout at session level: await client.query('SET LOCAL statement_timeout = 5000') inside a transaction/scope.
  - Use pg.cancel via a separate connection to cancel a running query (more complex).
- For Supabase session pooler, prefer statement_timeout or rely on driver/server-side timeouts.

*/


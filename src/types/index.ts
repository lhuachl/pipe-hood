/**
 * Tipos base del ORM
 */

export interface SQLFragment {
  text: string;
  params: unknown[];
}

export interface IExecutor {
  execute<T = any>(sql: string, params: unknown[]): Promise<T[]>;
}

export interface ICompiler {
  compile(state: QueryState): { sql: string; params: unknown[] };
}

export interface QueryState {
  table: string;
  // SELECT
  selects: string[];
  // INSERT
  insertValues?: Record<string, unknown>;
  // UPDATE
  updateValues?: Record<string, unknown>;
  // WHERE
  where: SQLFragment[];
  // ORDER BY
  orderBy: Array<{ column: string; direction: 'asc' | 'desc' }>;
  // LIMIT / OFFSET
  limit?: number;
  offset?: number;
  // Query Type
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
}

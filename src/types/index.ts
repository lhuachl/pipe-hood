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
  selects: string[];
  where: SQLFragment[];
  orderBy: Array<{ column: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
}

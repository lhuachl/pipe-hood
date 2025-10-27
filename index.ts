/**
 * Punto de entrada del ORM
 * Exporta las clases principales para que puedan ser importadas
 */

export { QueryBuilder } from './src/QueryBuilder/QueryBuilder.js';
export { PostgresCompiler } from './src/compiler/PostgresCompiler.js';
export { SupabaseExecutor } from './src/executor/SupabaseExecutor.js';
export { QueryBuilderFactory } from './src/factory/QueryBuilderFactory.js';
export type { ICompiler, IExecutor, QueryState, SQLFragment } from './src/types/index.js';   
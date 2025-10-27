import { QueryBuilder } from '../QueryBuilder/QueryBuilder.js';
import { ICompiler, IExecutor } from '../types/index.js';

/**
 * Factory para crear QueryBuilder con dependencias inyectadas
 * Mantiene el código DRY y hace fácil cambiar implementaciones
 */
export class QueryBuilderFactory {
  constructor(private compiler: ICompiler, private executor: IExecutor) {}

  create(): QueryBuilder {
    return new QueryBuilder(this.compiler, this.executor);
  }
}

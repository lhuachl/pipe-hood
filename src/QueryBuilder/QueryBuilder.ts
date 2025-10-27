import { ICompiler, IExecutor, QueryState } from '../types/index.js';

/**
 * QueryBuilder desacoplado con inyección de dependencias
 * - Responsabilidad única: orquestar estado
 * - ICompiler: compila estado a SQL
 * - IExecutor: ejecuta SQL en la BD
 * - Mutabilidad: cada método modifica el estado y retorna this
 */
export class QueryBuilder {
  private _state: QueryState = {
    table: '',
    selects: [],
    where: [],
    orderBy: [],
  };

  constructor(
    private compiler: ICompiler,
    private executor: IExecutor
  ) {}

  /**
   * Define la tabla principal
   */
  table(name: string): this {
    this._state.table = name;
    return this;
  }

  /**
   * Define columnas a seleccionar. Si no se especifica, usa *
   */
  select(...cols: string[]): this {
    if (cols.length) this._state.selects.push(...cols);
    return this;
  }

  /**
   * WHERE con igualdad simple
   */
  whereEq(field: string, value: unknown): this {
    this._state.where.push({ text: `${field} = ?`, params: [value] });
    return this;
  }

  /**
   * WHERE con texto SQL plano y parámetros
   */
  whereRaw(text: string, ...params: unknown[]): this {
    this._state.where.push({ text, params });
    return this;
  }

  /**
   * WHERE con IN
   */
  whereIn(field: string, values: unknown[]): this {
    if (!values.length) {
      this._state.where.push({ text: 'FALSE', params: [] });
      return this;
    }
    const placeholders = values.map(() => '?').join(', ');
    this._state.where.push({
      text: `${field} IN (${placeholders})`,
      params: [...values],
    });
    return this;
  }

  /**
   * ORDER BY
   */
  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._state.orderBy.push({ column, direction });
    return this;
  }

  /**
   * LIMIT
   */
  limit(n: number): this {
    this._state.limit = n;
    return this;
  }

  /**
   * OFFSET
   */
  offset(n: number): this {
    this._state.offset = n;
    return this;
  }

  /**
   * Compila el query builder a SQL con parámetros (PostgreSQL style: $1, $2, etc)
   */
  compile(): { sql: string; params: unknown[] } {
    return this.compiler.compile(this._state);
  }

  /**
   * Ejecuta la consulta usando el executor inyectado
   */
  async execute<T = any>(): Promise<T[]> {
    const { sql, params } = this.compile();
    return this.executor.execute<T>(sql, params);
  }

  /**
   * Devuelve el SQL sin ejecutar
   */
  toSQL(): string {
    const { sql } = this.compile();
    return sql;
  }

  /**
   * Clona el builder para evitar mutaciones compartidas
   */
  clone(): QueryBuilder {
    const cloned = new QueryBuilder(this.compiler, this.executor);
    cloned._state = {
      table: this._state.table,
      selects: [...this._state.selects],
      where: this._state.where.map((f) => ({
        text: f.text,
        params: [...f.params],
      })),
      orderBy: this._state.orderBy.map((o) => ({ ...o })),
      limit: this._state.limit,
      offset: this._state.offset,
    };
    return cloned;
  }
}
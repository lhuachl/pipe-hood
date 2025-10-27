import { ICompiler, QueryState, SQLFragment } from '../types/index.js';

/**
 * Compilador SQL para PostgreSQL
 * Responsabilidad única: convertir QueryState a SQL
 */
export class PostgresCompiler implements ICompiler {
  compile(state: QueryState): { sql: string; params: unknown[] } {
    if (!state.table) throw new Error('Table es requerido');

    const allParams: unknown[] = [];

    const replacePlaceholders = (frag: SQLFragment): string => {
      let text = frag.text;
      for (const param of frag.params) {
        allParams.push(param);
        // Reemplazar solo el PRIMER '?' encontrado con $n
        text = text.replace(/\?/, `$${allParams.length}`);
      }
      return text;
    };

    const sel = state.selects.length ? state.selects.join(', ') : '*';
    let sql = `SELECT ${sel} FROM ${state.table}`;

    if (state.where.length) {
      const whereParts = state.where.map(replacePlaceholders);
      sql += ' WHERE ' + whereParts.join(' AND ');
    }

    if (state.orderBy.length) {
      const orderParts = state.orderBy.map(
        (o) => `${o.column} ${o.direction.toUpperCase()}`
      );
      sql += ' ORDER BY ' + orderParts.join(', ');
    }

    if (state.limit !== undefined) sql += ` LIMIT ${state.limit}`;
    if (state.offset !== undefined) sql += ` OFFSET ${state.offset}`;

    return { sql, params: allParams };
  }
}

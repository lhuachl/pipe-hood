import { ICompiler, QueryState, SQLFragment } from '../types/index.js';

/**
 * Compilador SQL para PostgreSQL
 * Responsabilidad única: convertir QueryState a SQL
 * Soporta: SELECT, INSERT, UPDATE, DELETE
 */
export class PostgresCompiler implements ICompiler {
  compile(state: QueryState): { sql: string; params: unknown[] } {
    if (!state.table) throw new Error('Table es requerido');

    switch (state.type) {
      case 'INSERT':
        return this.compileInsert(state);
      case 'UPDATE':
        return this.compileUpdate(state);
      case 'DELETE':
        return this.compileDelete(state);
      case 'SELECT':
      default:
        return this.compileSelect(state);
    }
  }

  private compileSelect(state: QueryState): { sql: string; params: unknown[] } {
    const allParams: unknown[] = [];

    const replacePlaceholders = (frag: SQLFragment): string => {
      let text = frag.text;
      for (const param of frag.params) {
        allParams.push(param);
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

  private compileInsert(state: QueryState): { sql: string; params: unknown[] } {
    if (!state.insertValues || Object.keys(state.insertValues).length === 0) {
      throw new Error('INSERT requiere valores (insertValues)');
    }

    const columns = Object.keys(state.insertValues);
    const values = Object.values(state.insertValues);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const sql = `INSERT INTO ${state.table} (${columns.join(', ')}) VALUES (${placeholders})`;

    return { sql, params: values };
  }

  private compileUpdate(state: QueryState): { sql: string; params: unknown[] } {
    if (!state.updateValues || Object.keys(state.updateValues).length === 0) {
      throw new Error('UPDATE requiere valores (updateValues)');
    }

    if (state.where.length === 0) {
      throw new Error('UPDATE requiere al menos una condición WHERE');
    }

    const allParams: unknown[] = [];
    const updateEntries = Object.entries(state.updateValues);

    // Construir SET clause con placeholders
    const setClauses = updateEntries.map(([col, val], i) => {
      allParams.push(val);
      return `${col} = $${allParams.length}`;
    });

    let sql = `UPDATE ${state.table} SET ${setClauses.join(', ')}`;

    // Agregar WHERE
    const replacePlaceholders = (frag: SQLFragment): string => {
      let text = frag.text;
      for (const param of frag.params) {
        allParams.push(param);
        text = text.replace(/\?/, `$${allParams.length}`);
      }
      return text;
    };

    if (state.where.length) {
      const whereParts = state.where.map(replacePlaceholders);
      sql += ' WHERE ' + whereParts.join(' AND ');
    }

    return { sql, params: allParams };
  }

  private compileDelete(state: QueryState): { sql: string; params: unknown[] } {
    if (state.where.length === 0) {
      throw new Error('DELETE requiere al menos una condición WHERE (seguridad)');
    }

    const allParams: unknown[] = [];

    const replacePlaceholders = (frag: SQLFragment): string => {
      let text = frag.text;
      for (const param of frag.params) {
        allParams.push(param);
        text = text.replace(/\?/, `$${allParams.length}`);
      }
      return text;
    };

    let sql = `DELETE FROM ${state.table}`;

    const whereParts = state.where.map(replacePlaceholders);
    sql += ' WHERE ' + whereParts.join(' AND ');

    return { sql, params: allParams };
  }
}

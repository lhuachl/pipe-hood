import { ExcecQuery } from "../types/ExcecQuery.js";
import { SQLFragment } from "../types/sqlFragment.js";

class QueryBuilder
{
    private _table = '';
    private _columns: string[] = [];
    private _where: Record<string, any> = {};
    private _limit?: number;
    private _groupBy: string[] = [];
    private _orderBy: { column: string; direction: 'asc' | 'desc' }[] = [];
    private _offset?: number;
    private _joins: { table: string; condition: string; type: 'inner' | 'left' | 'right' }[] = [];
    constructor() {}   
    table(tableName: string): this {
        this._table = tableName;
        return this;
        
    }
    select(...columns: string[]): this {
        this._columns.push(...columns);
        return this;}
    whereEq(field: string, value: unknown) {
    this._where.push({ text: `${field} = ?`, params: [value] });
    return this;
  }

  // raw SQL fragment via template or manual construction (useful for IN, complex cond)
  whereRaw(text: string, ...params: unknown[]) {
    this._where.push({ text, params });
    return this;
  }
  orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): this {
    this._orderBy.push({ column, direction });
    return this;
  }
  groupBy(...columns: string[]): this {
    this._groupBy.push(...columns);
    return this;
  }
  limit(count: number): this {
    this._limit = count;
    return this;
  }
  offset(count: number): this {
    this._offset = count;
    return this;
  }
  Join(table: string, condition: string, type: 'inner' | 'left' | 'right' = 'inner'): this {
    this._joins.push({ table, condition, type });
    return this;
  }
}
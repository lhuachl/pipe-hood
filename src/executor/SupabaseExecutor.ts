import { IExecutor } from '../types/index.js';
import postgres from 'postgres';

/**
 * Ejecutor para PostgreSQL con session pooler (Supabase)
 * Responsabilidad única: ejecutar SQL contra la BD
 */
export class SupabaseExecutor implements IExecutor {
  constructor(private client: ReturnType<typeof postgres>) {}

  async execute<T = any>(sql: string, params: unknown[]): Promise<T[]> {
    try {
      const result = await this.client.unsafe(sql, params as any);
      return result as unknown as T[];
    } catch (error) {
      throw new Error(
        `Error ejecutando query: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

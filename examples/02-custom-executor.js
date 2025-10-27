/**
 * EJEMPLO 2: Inyección de dependencias personalizada
 *
 * Este ejemplo muestra cómo extender o reemplazar implementaciones
 * manteniendo la arquitectura desacoplada
 */
import 'dotenv/config';
import postgres from 'postgres';
import { PostgresCompiler } from '../src/compiler/PostgresCompiler.js';
import { QueryBuilderFactory } from '../src/factory/QueryBuilderFactory.js';
/**
 * Executor personalizado que logea queries antes de ejecutarlas
 */
class LoggingExecutor {
    constructor(baseExecutor) {
        this.baseExecutor = baseExecutor;
    }
    async execute(sql, params) {
        console.log('🔍 Ejecutando SQL:', sql);
        console.log('📦 Parámetros:', params);
        return this.baseExecutor.execute(sql, params);
    }
}
async function main() {
    try {
        const pgClient = postgres({
            host: process.env.host,
            port: Number(process.env.port) || 5432,
            database: process.env.database,
            username: process.env.user,
            password: process.env.password,
            ssl: 'require',
        });
        console.log('✅ Conectado a Supabase\n');
        // Crear base executor
        const { SupabaseExecutor } = await import('../src/executor/SupabaseExecutor.js');
        const baseExecutor = new SupabaseExecutor(pgClient);
        // Envolver con logging
        const loggingExecutor = new LoggingExecutor(baseExecutor);
        // Usar factory con executor personalizado
        const compiler = new PostgresCompiler();
        const factory = new QueryBuilderFactory(compiler, loggingExecutor);
        // Las queries ahora loguearán antes de ejecutarse
        const query = factory
            .create()
            .table('users')
            .select('id', 'name')
            .limit(5);
        console.log('📋 Query construida:', query.toSQL());
        console.log('\n⏳ Ejecutando...\n');
        // await query.execute();
        await pgClient.end();
        console.log('\n✅ Desconectado');
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
main();

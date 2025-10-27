/**
 * EJEMPLO 1: Conexión básica a Supabase con QueryBuilder
 *
 * Este ejemplo muestra:
 * 1. Cómo crear un cliente PostgreSQL para Supabase
 * 2. Inyectar dependencias en el QueryBuilder
 * 3. Usar el QueryBuilder para construir queries
 */

import 'dotenv/config';
import postgres from 'postgres';
import { PostgresCompiler } from '../src/compiler/PostgresCompiler.js';
import { SupabaseExecutor } from '../src/executor/SupabaseExecutor.js';
import { QueryBuilderFactory } from '../src/factory/QueryBuilderFactory.js';

async function main() {
  try {
    // 1. Crear cliente PostgreSQL para Supabase (Session Pool)
    const pgClient = postgres({
      host: process.env.host,
      port: Number(process.env.port) || 5432,
      database: process.env.database,
      username: process.env.user,
      password: process.env.password,
      ssl: 'require',
    });

    console.log('✅ Conectado a Supabase');

    // 2. Crear dependencias (inyección)
    const compiler = new PostgresCompiler();
    const executor = new SupabaseExecutor(pgClient);

    // 3. Crear factory
    const factory = new QueryBuilderFactory(compiler, executor);

    // 4. Crear y ejecutar queries
    console.log('\n📋 Ejecutando queries...\n');

    // Query 1: Obtener primeras 5 filas
    const query1 = factory.create().table('users').limit(5);
    console.log('Query 1 (SQL):', query1.toSQL());
    // const result1 = await query1.execute();
    // console.log('Resultado:', result1);

    // Query 2: Filtrar por condición
    const query2 = factory
      .create()
      .table('users')
      .select('id', 'name', 'email')
      .whereEq('id', 1);
    console.log('\nQuery 2 (SQL):', query2.toSQL());
    // const result2 = await query2.execute();
    // console.log('Resultado:', result2);

    // Query 3: WHERE IN
    const query3 = factory
      .create()
      .table('users')
      .whereIn('status', ['active', 'pending'])
      .orderBy('created_at', 'desc')
      .limit(10);
    console.log('\nQuery 3 (SQL):', query3.toSQL());

    // Query 4: Clonación sin mutación
    const baseQuery = factory.create().table('products').select('*');
    const query4a = baseQuery.clone().whereEq('category', 'electronics');
    const query4b = baseQuery.clone().whereEq('category', 'books');

    console.log('\nQuery 4a (Cloned - Electronics):', query4a.toSQL());
    console.log('Query 4b (Cloned - Books):', query4b.toSQL());
    console.log('Base (sin cambios):', baseQuery.toSQL());

    await pgClient.end();
    console.log('\n✅ Desconectado de Supabase');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();

/**
 * TEST: Verificar conexión real a Supabase
 * Este archivo prueba si realmente nos conectamos y ejecutamos queries
 */

import 'dotenv/config';
import postgres from 'postgres';

async function testConnection() {
  try {
    console.log('🔍 Verificando credenciales de BD...');
    console.log('Host:', process.env.host);
    console.log('Port:', process.env.port);
    console.log('Database:', process.env.database);
    console.log('User:', process.env.user);
    console.log('Password:', process.env.password ? '***' : 'NO DEFINIDO');
    console.log('');

    // Crear cliente
    const sql = postgres({
      host: process.env.host,
      port: Number(process.env.port) || 5432,
      database: process.env.database,
      username: process.env.user,
      password: process.env.password,
      ssl: 'require',
    });

    console.log('⏳ Intentando conectar a PostgreSQL...');

    // Test 1: Query simple
    try {
      const version = await sql`SELECT version()`;
      console.log('✅ CONEXIÓN EXITOSA');
      console.log('📍 PostgreSQL versión:', version[0].version.split(',')[0]);
    } catch (error) {
      console.error('❌ ERROR en query:', error instanceof Error ? error.message : error);
      throw error;
    }

    // Test 2: Obtener lista de tablas
    try {
      console.log('\n📋 Tablas en la base de datos:');
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      if (tables.length === 0) {
        console.log('   ⚠️  No hay tablas públicas en la BD');
      } else {
        tables.forEach((t, i) => {
          console.log(`   ${i + 1}. ${t.table_name}`);
        });
      }
    } catch (error) {
      console.error('⚠️  Error obteniendo tablas:', error instanceof Error ? error.message : error);
    }

    // Test 3: Intentar query a tabla "users" si existe
    try {
      console.log('\n🔎 Intentando query a tabla "users"...');
      const users = await sql`SELECT * FROM users LIMIT 1`;
      console.log('✅ Tabla "users" existe. Primero registro:', users[0]);
    } catch (error) {
      console.log('⚠️  Tabla "users" no existe o error:', error instanceof Error ? error.message : error);
    }

    await sql.end();
    console.log('\n✅ Desconectado correctamente');
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

testConnection();

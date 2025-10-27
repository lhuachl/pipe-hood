// ejemplo-javascript-puro.js
// Ejemplo de cómo usar pipehood desde JavaScript vanilla (sin TypeScript)

import { QueryBuilderFactory, PostgresCompiler, SupabaseExecutor } from 'pipehood';
import postgres from 'postgres';

// 1. Conectar a la base de datos
const db = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// 2. Crear la fábrica con inyección de dependencias
const compiler = new PostgresCompiler();
const executor = new SupabaseExecutor(db);
const factory = new QueryBuilderFactory(compiler, executor);

// 3. Ejemplo 1: Consulta simple
async function obtenerUsuarios() {
  console.log('📋 Obteniendo todos los usuarios...');
  
  const usuarios = await factory.create()
    .table('usuarios')
    .select(['id', 'nombre', 'email'])
    .execute();
  
  console.log('✅ Usuarios encontrados:', usuarios.length);
  console.log(usuarios);
  
  return usuarios;
}

// 4. Ejemplo 2: Consulta con filtro
async function obtenerUsuariosActivos() {
  console.log('\n🔍 Obteniendo usuarios activos...');
  
  const activos = await factory.create()
    .table('usuarios')
    .select(['*'])
    .whereEq('activo', true)
    .orderBy('nombre', 'ASC')
    .execute();
  
  console.log('✅ Usuarios activos:', activos.length);
  
  return activos;
}

// 5. Ejemplo 3: Consultas paralelas
async function consultasParalelas() {
  console.log('\n⚡ Ejecutando consultas en paralelo...');
  
  const [usuarios, pedidos, clientes] = await Promise.all([
    factory.create()
      .table('usuarios')
      .select(['*'])
      .execute(),
    factory.create()
      .table('pedidos')
      .select(['*'])
      .execute(),
    factory.create()
      .table('clientes')
      .select(['*'])
      .execute(),
  ]);
  
  console.log('✅ Usuarios:', usuarios.length);
  console.log('✅ Pedidos:', pedidos.length);
  console.log('✅ Clientes:', clientes.length);
  
  return { usuarios, pedidos, clientes };
}

// 6. Ejecutar ejemplos
async function main() {
  try {
    console.log('🚀 Iniciando ejemplos en JavaScript Puro\n');
    
    await obtenerUsuarios();
    await obtenerUsuariosActivos();
    await consultasParalelas();
    
    console.log('\n✨ ¡Todos los ejemplos completados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar conexión
    await db.end();
  }
}

main();

// examples/07-crud-operations.ts
// Ejemplo completo de CRUD: CREATE, READ, UPDATE, DELETE

import 'dotenv/config';
import { QueryBuilderFactory, PostgresCompiler, SupabaseExecutor } from '../index.js';
import postgres from 'postgres';

// Inicializar conexión con variables de entorno
const db = postgres({
  host: process.env.host,
  port: Number(process.env.port) || 5432,
  database: process.env.database,
  username: process.env.user,
  password: process.env.password,
  ssl: 'require',
});

// Crear factory
const compiler = new PostgresCompiler();
const executor = new SupabaseExecutor(db);
const factory = new QueryBuilderFactory(compiler, executor);

async function main() {
  console.log('🚀 Ejemplo de CRUD Operations con Tabla USUARIOS\n');

  try {
    // ============================================
    // 0. INSPECCIONAR ESTRUCTURA DE LA TABLA
    // ============================================
    console.log('🔍 0. Estructura de la tabla usuarios\n');
    
    const muestra = await factory.create()
      .table('usuarios')
      .limit(1)
      .execute();

    if (muestra.length > 0) {
      const columnas = Object.keys(muestra[0]);
      console.log('✅ Columnas encontradas:');
      columnas.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col}`);
      });
      console.log();
    }

    // ============================================
    // 1. CREATE (INSERT)
    // ============================================
    console.log('📝 1. INSERT - Crear nuevo usuario\n');

    const nuevoUsuario = {
      nombre: 'Carlos Perez Test',
      email: `carlos_${Date.now()}@test.com`,
    };

    const insertQuery = factory.create()
      .table('usuarios')
      .insert(nuevoUsuario);

    console.log('SQL:', insertQuery.toSQL());
    const resultadoInsert = await insertQuery.execute();
    console.log('✅ Usuario creado:', resultadoInsert);
    console.log();

    // ============================================
    // 2. READ (SELECT)
    // ============================================
    console.log('📖 2. SELECT - Leer usuarios\n');

    const usuarios = await factory.create()
      .table('usuarios')
      .select('*')
      .execute();

    console.log(`✅ Total de usuarios en la BD: ${usuarios.length}`);
    const ultimosUsuarios = usuarios.slice(-5);
    console.log('Últimos 5 usuarios:');
    ultimosUsuarios.forEach((u, i) => {
      const email = u.email ? ` (${u.email})` : '';
      console.log(`  ${i + 1}. ${u.nombre || u.id}${email}`);
    });
    console.log();

    // ============================================
    // 3. READ con FILTROS
    // ============================================
    console.log('🔍 3. SELECT con WHERE - Buscar por email\n');

    const emailABuscar = nuevoUsuario.email;
    const buscados = await factory.create()
      .table('usuarios')
      .select('*')
      .whereEq('email', emailABuscar)
      .execute();

    console.log(`✅ Usuarios encontrados con email "${emailABuscar}": ${buscados.length}`);
    buscados.forEach(u => {
      console.log(`  - ID: ${u.id}, Nombre: ${u.nombre}`);
    });
    console.log();

    // ============================================
    // 4. UPDATE
    // ============================================
    console.log('✏️ 4. UPDATE - Actualizar usuario\n');

    const nombreActualizado = `Carlos Perez Test (Modificado ${new Date().toLocaleTimeString()})`;
    const updateQuery = factory.create()
      .table('usuarios')
      .update({ 
        nombre: nombreActualizado
      })
      .whereEq('email', emailABuscar);

    console.log('SQL:', updateQuery.toSQL());
    const resultadoUpdate = await updateQuery.execute();
    console.log('✅ Usuario actualizado');
    console.log();

    // ============================================
    // 5. VERIFY UPDATE
    // ============================================
    console.log('🔍 5. Verificar UPDATE\n');

    const usuarioActualizado = await factory.create()
      .table('usuarios')
      .select('*')
      .whereEq('email', emailABuscar)
      .execute();

    console.log('✅ Usuario después del UPDATE:');
    usuarioActualizado.forEach(u => {
      const email = u.email ? ` (${u.email})` : '';
      console.log(`  - Nombre: ${u.nombre}${email}`);
    });
    console.log();

    // ============================================
    // 6. DELETE
    // ============================================
    console.log('🗑️ 6. DELETE - Eliminar usuario\n');

    const deleteQuery = factory.create()
      .table('usuarios')
      .whereEq('email', emailABuscar)
      .delete();

    console.log('SQL:', deleteQuery.toSQL());
    const resultadoDelete = await deleteQuery.execute();
    console.log('✅ Usuario eliminado');
    console.log();

    // ============================================
    // 7. VERIFY DELETE
    // ============================================
    console.log('🔍 7. Verificar DELETE\n');

    const usuariosRestantes = await factory.create()
      .table('usuarios')
      .select('*')
      .execute();

    console.log(`✅ Usuarios en la BD después del DELETE: ${usuariosRestantes.length}`);
    console.log();

    // ============================================
    // 8. BATCH OPERATIONS (Operaciones paralelas)
    // ============================================
    console.log('⚡ 8. OPERACIONES PARALELAS - Estadísticas\n');

    const [
      totalUsuarios,
      totalClientes,
      totalPedidos,
    ] = await Promise.all([
      factory.create()
        .table('usuarios')
        .select('*')
        .execute(),
      factory.create()
        .table('clientes')
        .select('*')
        .execute()
        .catch(() => []),
      factory.create()
        .table('pedidos')
        .select('*')
        .execute()
        .catch(() => []),
    ]);

    console.log('✅ Estadísticas generales:');
    console.log(`  - Usuarios: ${totalUsuarios.length}`);
    console.log(`  - Clientes: ${totalClientes.length}`);
    console.log(`  - Pedidos: ${totalPedidos.length}`);
    console.log();

    console.log('✨ ¡Todas las operaciones completadas!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.end();
  }
}

main();

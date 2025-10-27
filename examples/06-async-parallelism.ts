/**
 * EJEMPLO 6: Aprovechamiento de Asincronía y Paralelismo
 *
 * Demuestra:
 * - Queries secuenciales vs paralelas
 * - Promise.all() para paralelismo
 * - Manejo eficiente de conexiones
 * - Batching de queries
 */

import 'dotenv/config';
import postgres from 'postgres';
import { PostgresCompiler } from '../src/compiler/PostgresCompiler.js';
import { SupabaseExecutor } from '../src/executor/SupabaseExecutor.js';
import { QueryBuilderFactory } from '../src/factory/QueryBuilderFactory.js';

async function main() {
  const pgClient = postgres({
    host: process.env.host,
    port: Number(process.env.port) || 5432,
    database: process.env.database,
    username: process.env.user,
    password: process.env.password,
    ssl: 'require',
  });

  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           ASINCRONÍA Y PARALELISMO EN ORM                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const compiler = new PostgresCompiler();
    const executor = new SupabaseExecutor(pgClient);
    const factory = new QueryBuilderFactory(compiler, executor);

    // ============================================================
    // 1. ENFOQUE SECUENCIAL (más lento)
    // ============================================================
    console.log('📌 1. QUERIES SECUENCIALES (❌ Ineficiente)');
    console.log('─'.repeat(60));

    console.time('Secuencial');
    
    const usuarios1 = await factory
      .create()
      .table('usuarios')
      .execute();
    console.log(`✓ Usuarios consultados: ${usuarios1.length}`);

    const pedidos1 = await factory
      .create()
      .table('pedidos')
      .execute();
    console.log(`✓ Pedidos consultados: ${pedidos1.length}`);

    const clientes1 = await factory
      .create()
      .table('clientes')
      .execute();
    console.log(`✓ Clientes consultados: ${clientes1.length}`);

    console.timeEnd('Secuencial');

    // ============================================================
    // 2. ENFOQUE PARALELO (más rápido) ✅
    // ============================================================
    console.log('\n📌 2. QUERIES PARALELAS CON Promise.all() (✅ Eficiente)');
    console.log('─'.repeat(60));

    console.time('Paralelo');

    const [usuarios2, pedidos2, clientes2] = await Promise.all([
      factory.create().table('usuarios').execute(),
      factory.create().table('pedidos').execute(),
      factory.create().table('clientes').execute(),
    ]);

    console.log(`✓ Usuarios consultados: ${usuarios2.length}`);
    console.log(`✓ Pedidos consultados: ${pedidos2.length}`);
    console.log(`✓ Clientes consultados: ${clientes2.length}`);

    console.timeEnd('Paralelo');

    // ============================================================
    // 3. QUERIES COMPLEJAS EN PARALELO
    // ============================================================
    console.log('\n📌 3. QUERIES COMPLEJAS EN PARALELO');
    console.log('─'.repeat(60));

    console.time('Queries complejas paralelas');

    const [
      usuariosActivos,
      pedidosPendientes,
      pedidosEnTransito,
      clientesNaturales,
    ] = await Promise.all([
      factory
        .create()
        .table('usuarios')
        .select('id_usuario', 'nombre', 'rol')
        .whereEq('estado', 'Activo')
        .execute(),
      
      factory
        .create()
        .table('pedidos')
        .select('id_pedido', 'numero_tracking', 'monto_total')
        .whereEq('estado', 'Pendiente')
        .orderBy('monto_total', 'desc')
        .execute(),
      
      factory
        .create()
        .table('pedidos')
        .select('id_pedido', 'numero_tracking', 'estado')
        .whereEq('estado', 'En tránsito')
        .execute(),
      
      factory
        .create()
        .table('clientes')
        .select('id_cliente', 'tipo', 'telefono')
        .whereEq('tipo', 'Natural')
        .execute(),
    ]);

    console.log(`✓ Usuarios activos: ${usuariosActivos.length}`);
    console.log(`✓ Pedidos pendientes: ${pedidosPendientes.length}`);
    console.log(`✓ Pedidos en tránsito: ${pedidosEnTransito.length}`);
    console.log(`✓ Clientes naturales: ${clientesNaturales.length}`);

    console.timeEnd('Queries complejas paralelas');

    // ============================================================
    // 4. BATCHING: Procesar resultados en paralelo
    // ============================================================
    console.log('\n📌 4. BATCHING: Procesar Múltiples Operaciones');
    console.log('─'.repeat(60));

    console.time('Batching');

    // Obtener datos y procesarlos en paralelo
    const [usuarios3, pedidos3] = await Promise.all([
      factory.create().table('usuarios').execute(),
      factory.create().table('pedidos').execute(),
    ]);

    // Procesar datos en paralelo (simulado)
    const procesarDatos = async (data: any[]) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(data.length), 10);
      });
    };

    const [usuariosProcessed, pedidosProcessed] = await Promise.all([
      procesarDatos(usuarios3),
      procesarDatos(pedidos3),
    ]);

    console.log(`✓ Usuarios procesados: ${usuariosProcessed}`);
    console.log(`✓ Pedidos procesados: ${pedidosProcessed}`);

    console.timeEnd('Batching');

    // ============================================================
    // 5. CHAIN DE QUERIES: Paralelismo con dependencias
    // ============================================================
    console.log('\n📌 5. CHAINS CON DEPENDENCIAS');
    console.log('─'.repeat(60));

    console.time('Chains paralelos');

    // Primero: obtener usuarios
    const usuarios4 = await factory
      .create()
      .table('usuarios')
      .execute();

    // Después: en paralelo, obtener datos relacionados
    const [usuarioIds, pedidosRelacionados, clientesRelacionados] = await Promise.all([
      Promise.resolve(usuarios4.map((u: any) => u.id_usuario)),
      
      factory
        .create()
        .table('pedidos')
        .whereEq('estado', 'En tránsito')
        .execute(),
      
      factory
        .create()
        .table('clientes')
        .execute(),
    ]);

    console.log(`✓ IDs de usuarios: ${usuarioIds}`);
    console.log(`✓ Pedidos relacionados: ${pedidosRelacionados.length}`);
    console.log(`✓ Clientes relacionados: ${clientesRelacionados.length}`);

    console.timeEnd('Chains paralelos');

    // ============================================================
    // 6. COMPARACIÓN Y ANÁLISIS
    // ============================================================
    console.log('\n📌 ANÁLISIS Y RECOMENDACIONES');
    console.log('─'.repeat(60));

    console.log(`
✅ VENTAJAS DEL PARALELISMO:
  1. Múltiples queries se ejecutan simultáneamente
  2. Mejor aprovechamiento del pool de conexiones
  3. Menor tiempo total (N queries en 1 request vs N requests)
  4. Ideal para operaciones independientes

⚠️  CUÁNDO USAR:
  • Promise.all() → Cuando todas las queries son independientes
  • Promise.race() → Cuando necesitas el resultado más rápido
  • Promise.allSettled() → Cuando algunos pueden fallar

❌ EVITAR:
  • Queries en secuencia si son independientes
  • N+1 queries (obtener padre, luego hijo 1 por 1)
  • Bloqueos innecesarios

💡 RECOMENDACIONES:
  • Agrupa queries independientes con Promise.all()
  • Usa clonación (.clone()) para reutilizar builders
  • Mantén el pool de conexiones eficiente
  • Considera usar transacciones para operaciones relacionadas
    `);

    await pgClient.end();
    console.log('\n✅ Desconectado correctamente\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();

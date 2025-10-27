/**
 * EJEMPLO 5: Sistema de Logística Completo
 *
 * Caso de uso real: Consultar pedidos, clientes y transportistas
 * Demostrando:
 * - Queries múltiples
 * - Filtrado con WHERE
 * - Ordenamiento
 * - Paginación
 * - Clonación de builders
 * - Tipado genérico
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
        console.log('║        SISTEMA DE LOGÍSTICA - CONSULTAS AVANZADAS         ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');
        // Crear dependencias
        const compiler = new PostgresCompiler();
        const executor = new SupabaseExecutor(pgClient);
        const factory = new QueryBuilderFactory(compiler, executor);
        // ============================================================
        // 1. OBTENER TODOS LOS USUARIOS ACTIVOS
        // ============================================================
        console.log('📌 Consulta 1: Todos los Usuarios');
        console.log('─'.repeat(60));
        const usuariosActivos = await factory
            .create()
            .table('usuarios')
            .select('id_usuario', 'nombre', 'apellido', 'email', 'rol', 'estado')
            .orderBy('nombre', 'asc')
            .execute();
        console.log(`✅ Encontrados ${usuariosActivos.length} usuarios:\n`);
        usuariosActivos.forEach((user, i) => {
            console.log(`  ${i + 1}. ${user.nombre} ${user.apellido}` +
                ` | ${user.email}` +
                ` | Rol: ${user.rol}` +
                ` | Estado: ${user.estado}`);
        });
        // ============================================================
        // 2. OBTENER PEDIDOS EN TRÁNSITO
        // ============================================================
        console.log('\n📌 Consulta 2: Pedidos en Tránsito');
        console.log('─'.repeat(60));
        const pedidosEnTransito = await factory
            .create()
            .table('pedidos')
            .select('id_pedido', 'numero_tracking', 'id_cliente', 'fecha_solicitud', 'estado', 'monto_total')
            .whereEq('estado', 'En tránsito')
            .orderBy('fecha_solicitud', 'desc')
            .limit(5)
            .execute();
        console.log(`✅ Encontrados ${pedidosEnTransito.length} pedidos en tránsito:\n`);
        pedidosEnTransito.forEach((pedido, i) => {
            console.log(`  ${i + 1}. Pedido #${pedido.id_pedido}` +
                ` | Tracking: ${pedido.numero_tracking}` +
                ` | $${pedido.monto_total}` +
                ` | ${new Date(pedido.fecha_solicitud).toLocaleDateString()}`);
        });
        // ============================================================
        // 3. USAR CLONE PARA VARIANTES DE LA MISMA QUERY
        // ============================================================
        console.log('\n📌 Consulta 3: Clonación - Comparar Estados de Pedidos');
        console.log('─'.repeat(60));
        const baseQuery = factory
            .create()
            .table('pedidos')
            .select('id_pedido', 'numero_tracking', 'estado', 'monto_total')
            .limit(10);
        // Clone 1: Pedidos pendientes
        const pedidosPendientes = await baseQuery
            .clone()
            .whereEq('estado', 'Pendiente')
            .execute();
        // Clone 2: Pedidos entregados
        const pedidosEntregados = await baseQuery
            .clone()
            .whereEq('estado', 'Entregado')
            .execute();
        console.log(`✅ Pedidos Pendientes: ${pedidosPendientes.length}`);
        console.log(`✅ Pedidos Entregados: ${pedidosEntregados.length}`);
        console.log(`ℹ️  Query base no modificada: ${baseQuery.toSQL()}`);
        // ============================================================
        // 4. DEMONSTRAR SQL GENERADO
        // ============================================================
        console.log('\n📌 Consulta 4: Ejemplos de SQL Generado');
        console.log('─'.repeat(60));
        const ejemploQueries = [
            factory
                .create()
                .table('clientes')
                .select('id_cliente', 'tipo', 'documento_identidad')
                .limit(5),
            factory
                .create()
                .table('pedidos')
                .select('id_pedido', 'numero_tracking', 'monto_total')
                .whereEq('estado', 'En tránsito')
                .orderBy('monto_total', 'desc')
                .limit(3),
            factory
                .create()
                .table('usuarios')
                .select('nombre', 'email', 'rol')
                .orderBy('nombre', 'asc'),
        ];
        ejemploQueries.forEach((query, i) => {
            console.log(`\n  Ejemplo ${i + 1}:`);
            console.log(`  SQL: ${query.toSQL()}`);
        });
        // ============================================================
        // 5. ESTADÍSTICAS Y PAGINACIÓN
        // ============================================================
        console.log('\n📌 Consulta 5: Paginación de Pedidos');
        console.log('─'.repeat(60));
        const pageSize = 3;
        const page = 1;
        const offset = (page - 1) * pageSize;
        const pedidosPaginados = await factory
            .create()
            .table('pedidos')
            .select('id_pedido', 'numero_tracking', 'estado', 'monto_total')
            .orderBy('id_pedido', 'desc')
            .limit(pageSize)
            .offset(offset)
            .execute();
        console.log(`✅ Página ${page} de pedidos (${pageSize} por página):\n`);
        pedidosPaginados.forEach((pedido, i) => {
            console.log(`  ${i + 1}. Pedido #${pedido.id_pedido}` +
                ` | ${pedido.numero_tracking}` +
                ` | ${pedido.estado}` +
                ` | $${pedido.monto_total}`);
        });
        // ============================================================
        // 6. RESUMEN Y ESTADÍSTICAS
        // ============================================================
        console.log('\n📌 Resumen del Sistema');
        console.log('─'.repeat(60));
        const totalUsuarios = await factory
            .create()
            .table('usuarios')
            .limit(1)
            .execute();
        const totalPedidos = await factory
            .create()
            .table('pedidos')
            .limit(1)
            .execute();
        const totalClientes = await factory
            .create()
            .table('clientes')
            .limit(1)
            .execute();
        console.log('\n📊 Estadísticas Globales:');
        console.log(`  • Usuarios registrados: ${totalUsuarios.length > 0 ? 'Consultados' : '0'}`);
        console.log(`  • Pedidos totales: ${totalPedidos.length > 0 ? 'Consultados' : '0'}`);
        console.log(`  • Clientes registrados: ${totalClientes.length > 0 ? 'Consultados' : '0'}`);
        console.log('\n✅ Arquitectura demostrada:');
        console.log('  • Inyección de dependencias (Factory pattern)');
        console.log('  • Querybuilder fluido y mutable');
        console.log('  • Tipado genérico <T>');
        console.log('  • Clonación segura sin mutaciones');
        console.log('  • SQL parametrizado (prevención SQL injection)');
        console.log('  • Conexión real a Supabase Session Pooler');
        console.log('\n╚════════════════════════════════════════════════════════════╝\n');
        await pgClient.end();
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
main();

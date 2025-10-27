/**
 * EJEMPLO 4: Usar QueryBuilder con tus tablas reales
 * Consultando la BD de Supabase
 */
import 'dotenv/config';
import postgres from 'postgres';
import { PostgresCompiler } from '../src/compiler/PostgresCompiler.js';
import { SupabaseExecutor } from '../src/executor/SupabaseExecutor.js';
import { QueryBuilderFactory } from '../src/factory/QueryBuilderFactory.js';
async function main() {
    try {
        // Conectar a Supabase
        const pgClient = postgres({
            host: process.env.host,
            port: Number(process.env.port) || 5432,
            database: process.env.database,
            username: process.env.user,
            password: process.env.password,
            ssl: 'require',
        });
        console.log('✅ Conectado a Supabase\n');
        // Crear factory con dependencias inyectadas
        const compiler = new PostgresCompiler();
        const executor = new SupabaseExecutor(pgClient);
        const factory = new QueryBuilderFactory(compiler, executor);
        // Query 1: Listar usuarios
        console.log('📋 Query 1: Estructura de tabla usuarios');
        try {
            const usuariosData = await factory
                .create()
                .table('usuarios')
                .limit(1)
                .execute();
            if (usuariosData.length > 0) {
                const columns = Object.keys(usuariosData[0]);
                console.log(`✅ Tabla "usuarios" tiene ${columns.length} columnas:`);
                columns.forEach((col, i) => {
                    console.log(`  ${i + 1}. ${col}`);
                });
            }
        }
        catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
        }
        // Query 2: Listar clientes
        console.log('\n📋 Query 2: Estructura de tabla clientes');
        try {
            const clientesData = await factory
                .create()
                .table('clientes')
                .limit(1)
                .execute();
            if (clientesData.length > 0) {
                const columns = Object.keys(clientesData[0]);
                console.log(`✅ Tabla "clientes" tiene ${columns.length} columnas:`);
                columns.forEach((col, i) => {
                    console.log(`  ${i + 1}. ${col}`);
                });
            }
        }
        catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
        }
        // Query 3: Contar órdenes
        console.log('\n📋 Query 3: Estructura de tabla pedidos');
        try {
            const pedidos = await factory
                .create()
                .table('pedidos')
                .limit(1)
                .execute();
            if (pedidos.length > 0) {
                const columns = Object.keys(pedidos[0]);
                console.log(`✅ Tabla "pedidos" tiene ${columns.length} columnas:`);
                columns.forEach((col, i) => {
                    console.log(`  ${i + 1}. ${col}`);
                });
                // Ahora query con columnas correctas
                console.log('\n📋 Query 3b: Primeros 3 pedidos');
                const query3b = factory
                    .create()
                    .table('pedidos')
                    .select('id_pedido', 'numero_tracking', 'estado', 'monto_total')
                    .limit(3);
                console.log('SQL:', query3b.toSQL());
                const pedidosData = await query3b.execute();
                console.log(`✅ Encontrados ${pedidosData.length} pedidos:`);
                pedidosData.forEach((p, i) => {
                    console.log(`  ${i + 1}. Pedido #${p.id_pedido} - Tracking: ${p.numero_tracking} - Estado: ${p.estado}`);
                });
            }
        }
        catch (error) {
            console.error('❌ Error:', error instanceof Error ? error.message : error);
        }
        // Query 4: Ejemplo con WHERE
        console.log('\n📋 Query 4: Transportistas (generando SQL, sin ejecutar)');
        const query4 = factory
            .create()
            .table('transportistas')
            .select('id', 'nombre', 'empresa')
            .orderBy('nombre', 'asc')
            .limit(10);
        console.log('SQL:', query4.toSQL());
        await pgClient.end();
        console.log('\n✅ Desconectado correctamente');
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
main();

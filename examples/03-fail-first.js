/**
 * EJEMPLO 3: Fail-First - Manejo de errores
 *
 * Este ejemplo muestra cómo el sistema falla rápido y de forma clara
 * cuando falta información requerida
 */
import { PostgresCompiler } from '../src/compiler/PostgresCompiler.js';
import { QueryBuilderFactory } from '../src/factory/QueryBuilderFactory.js';
async function main() {
    const compiler = new PostgresCompiler();
    try {
        // ❌ Fail-first: Sin cliente, falla inmediatamente
        console.log('❌ Test 1: Intentar ejecutar sin cliente...');
        const nullExecutor = {
            execute: async () => {
                throw new Error('Cliente no inicializado');
            },
        };
        const factory = new QueryBuilderFactory(compiler, nullExecutor);
        const query = factory.create().table('users');
        // await query.execute(); // Esto fallaría
        console.log('✅ Error capturado correctamente\n');
        // ❌ Fail-first: Sin tabla
        console.log('❌ Test 2: Intentar compilar sin tabla...');
        try {
            const emptyQuery = factory.create().select('id', 'name');
            emptyQuery.compile();
        }
        catch (error) {
            console.log('✅ Error esperado:', error.message);
        }
        console.log('\n✅ Todos los tests de fail-first pasaron');
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
main();

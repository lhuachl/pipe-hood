/**
 * DIAGNÓSTICO: Investigar datos reales en la BD
 */

import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const sql = postgres({
    host: process.env.host,
    port: Number(process.env.port) || 5432,
    database: process.env.database,
    username: process.env.user,
    password: process.env.password,
    ssl: 'require',
  });

  try {
    console.log('🔍 Investigando datos en la BD...\n');

    // Usuarios
    console.log('📋 USUARIOS:');
    const usuarios = await sql`SELECT * FROM usuarios`;
    console.log(`Total: ${usuarios.length}`);
    usuarios.forEach((u: any) => {
      console.log(`  - ID: ${u.id_usuario} | ${u.nombre} ${u.apellido} | Estado: ${u.estado} | Rol: ${u.rol}`);
    });

    // Pedidos
    console.log('\n📋 PEDIDOS:');
    const pedidos = await sql`SELECT * FROM pedidos`;
    console.log(`Total: ${pedidos.length}`);
    pedidos.forEach((p: any) => {
      console.log(`  - ID: ${p.id_pedido} | Tracking: ${p.numero_tracking} | Estado: ${p.estado} | Monto: $${p.monto_total}`);
    });

    // Clientes
    console.log('\n📋 CLIENTES:');
    const clientes = await sql`SELECT * FROM clientes`;
    console.log(`Total: ${clientes.length}`);
    clientes.forEach((c: any) => {
      console.log(`  - ID: ${c.id_cliente} | Tipo: ${c.tipo} | Documento: ${c.documento_identidad}`);
    });

    // Transportistas
    console.log('\n📋 TRANSPORTISTAS:');
    const transportistas = await sql`SELECT * FROM transportistas`;
    console.log(`Total: ${transportistas.length}`);
    transportistas.forEach((t: any) => {
      console.log(`  - ID: ${t.id_transportista} | ${t.nombre} | Empresa: ${t.empresa}`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main();

import sql from '../db.js';

async function testConnection() {
  try {
    const result = await sql`SELECT version() AS version`;
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('Versión:', result[0].version);
  } catch (error) {
    console.error('❌ Error al conectar:', error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

testConnection();

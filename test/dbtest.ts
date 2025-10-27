import 'dotenv/config';
import { Client } from 'pg';

async function testConnection() {
  const client = new Client({
    host: process.env.host,
    port: Number(process.env.port),
    database: process.env.database,
    user: process.env.user,
    password: process.env.password,
  });

  try {
    await client.connect();
    console.log('¡Conexión exitosa a la base de datos!');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  } finally {
    await client.end();
  }
}

testConnection();
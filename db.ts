import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres({
  host: process.env.host,
  port: Number(process.env.port) || 5432,
  database: process.env.database,
  username: process.env.user,
  password: process.env.password,
  ssl: 'require',
});

export default sql;
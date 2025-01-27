import pg from 'pg';

const pool = new pg.Pool({
  user: 'serch_dev',
  host: 'db',
  database: 'glossa_dev',
  password: 'silvio_vive_dev',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado a Postgres');
  } catch (e) {
    console.error(e.message);
  }
}

testConnection();

export default pool; // Export the pool to use in other parts of your app

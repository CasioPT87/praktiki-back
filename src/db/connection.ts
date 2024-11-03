import pg from 'pg';

const client = new pg.Client({
  user: 'serch_dev',
  host: 'db',
  database: 'glossa_dev',
  password: 'silvio_vive_dev',
  port: 5432,
});

// Log connection success
client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database successfully!');
  })
  .catch((err) => {
    console.error('Connection to PostgreSQL database failed:', err);
  });

export default client; // Export the pool to use in other parts of your app

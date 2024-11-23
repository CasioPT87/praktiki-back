import pg from 'pg';

// Shared PostgreSQL connection settings
const devConnection = {
  user: 'serch_dev',
  host: 'localhost', // when its ran inside of the container, the host is "db"
  database: 'glossa_dev',
  password: 'silvio_vive_dev',
  port: 5422, // when its ran from inside of the container, the port is 5432
};

// Log connection success
const testClient = new pg.Client(devConnection);
testClient
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database successfully!');
    testClient.end(); // Close the test client after checking the connection
  })
  .catch((err) => {
    console.error('Connection to PostgreSQL database failed:', err);
    testClient.end();
  });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'pg',
    connection: devConnection, // prod connection in the future
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  production: {
    client: 'pg',
    connection: {
      ...devConnection,
      database: 'glossa_prod', // Change the database name for production
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

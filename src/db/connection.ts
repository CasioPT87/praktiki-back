
import { Pool } from 'pg';

const pool = new Pool({
    user: 'serch_dev',       
    host: 'db',          
    database: 'glossa_dev',      
    password: 'silvio_vive_dev',     
    port: 5432,              
});

// Log connection success
pool.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database successfully!');
    })
    .catch(err => {
        console.error('Connection to PostgreSQL database failed:', err);
    });

export default pool; // Export the pool to use in other parts of your app
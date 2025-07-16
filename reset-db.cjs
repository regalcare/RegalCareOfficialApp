const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting to database...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetDatabase() {
  try {
    console.log('Dropping old tables...');
    
    // Drop old tables
    await pool.query('DROP TABLE IF EXISTS bin_cleaning_appointments CASCADE');
    console.log('✓ Dropped bin_cleaning_appointments');
    
    await pool.query('DROP TABLE IF EXISTS customers CASCADE');
    console.log('✓ Dropped customers');
    
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    console.log('✓ Dropped messages');
    
    await pool.query('DROP TABLE IF EXISTS routes CASCADE');
    console.log('✓ Dropped routes');
    
    console.log('\nAll old tables dropped successfully!');
    console.log('Now run: npm run db:push');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetDatabase();
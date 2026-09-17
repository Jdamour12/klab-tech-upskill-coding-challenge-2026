require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('Database schema ready.');
  await pool.end();
}

init().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

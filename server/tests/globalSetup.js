require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

module.exports = async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'schema.sql'), 'utf8');
  await pool.query(schema);
  await pool.end();
};

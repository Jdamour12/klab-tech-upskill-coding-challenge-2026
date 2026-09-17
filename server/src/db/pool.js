const { Pool } = require('pg');

// Hosted Postgres providers (Neon, Render, etc.) require SSL and use
// certificates that Node's default trust store can't always fully verify —
// disabling strict verification is the standard approach for these
// providers. Local/Docker Postgres has no SSL configured, so this only
// applies once DATABASE_URL points somewhere other than localhost.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

module.exports = pool;

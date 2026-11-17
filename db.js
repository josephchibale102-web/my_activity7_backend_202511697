const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment ssl if required by your remote database host (e.g., Render)
  // ssl: { rejectUnauthorized: false }
});

module.exports = pool;
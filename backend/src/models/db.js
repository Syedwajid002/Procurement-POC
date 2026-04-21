const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const pool = {
  async query(text, params) {
    const rows = await sql.query(text, params || []);
    return { rows };
  },
  async connect() {
    return {
      async query(text, params) {
        const rows = await sql.query(text, params || []);
        return { rows };
      },
      release() {}
    };
  },
  async end() {}
};

module.exports = pool;

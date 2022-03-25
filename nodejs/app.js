'use strict';

const Pool = require('pg').Pool

const pool = new Pool({
  user: 'decentrabets',
  host: 'decentrabets.ddns.net',
  database: 'decentrabets',
  password: 'q1w2e3',
  port: 5432,
})

pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    results.rows.forEach(element => {
        console.log(element.email)
    });
})

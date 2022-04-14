'use strict';

const Pool = require('pg').Pool
const fs = require('fs')

let configFile = fs.readFileSync(__dirname+'/config.json')
let dbconfig = JSON.parse(configFile);

const pool = new Pool({
  user: dbconfig.database.username,
  host: dbconfig.database.host,
  database: dbconfig.database.database,
  password: dbconfig.database.password,
  port: dbconfig.database.port,
})

pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    results.rows.forEach(element => {
        console.log(element.email)
    });
})

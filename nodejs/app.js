'use strict';

const Pool = require('pg').Pool
const fs = require('fs')

let configFile = fs.readFileSync(__dirname+'/config.json')
let dbconfig = JSON.parse(configFile);

const pool = new Pool({
<<<<<<< HEAD
  user: dbconfig.database.username,
  host: dbconfig.database.host,
  database: dbconfig.database.database,
  password: dbconfig.database.password,
  port: dbconfig.database.port,
=======
  user: 'decentrabets',
  host: 'decentrabets.ddns.net',
  database: '',
  password: '',
  port: 5432,
>>>>>>> 0d4f6f24e5df4c3f72931e114ba7fdfc8cc355ec
})

pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    results.rows.forEach(element => {
        console.log(element.email)
    });
})

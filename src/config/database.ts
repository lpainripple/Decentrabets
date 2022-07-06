const config = require("./index");
const { Pool } = require('pg')

const pool = new Pool(config.database);
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err:any) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

module.exports = {
    query: (text:string, params:string[], callback:any) => {
        return pool.query(text, params, callback)
    },
}
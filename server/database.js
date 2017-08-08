/**
 * Created by jiangnan on 17/7/16.
 */
var knex = require('knex')

var IS_DEV = process.env.NODE_ENV === 'dev'

const db = knex({
  client: 'mysql',
  connection: {
  host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '1q2w3e4r',
    database: IS_DEV ? 'test' : 'cigem',
  },
  pool: {
    min: 5,
    max: 50,
    acquireConnectionTimeout: 5 * 1000,
    idleTimeoutMillis: 60 * 1000,
    syncInterval: 10 * 1000,
    acquireTimeout: 30 * 1000,
    disposeTimeout: 30 * 1000,
    maxRequests: Infinity,
    requestTimeout: Infinity,
  },
})

module.exports = db
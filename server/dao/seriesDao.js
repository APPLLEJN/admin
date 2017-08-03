const baseDao = require('./baseDao')
const db = require('../database')

class seriesDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new seriesDao('series', ['name', 'en_name', 'image_url'], 'sort')
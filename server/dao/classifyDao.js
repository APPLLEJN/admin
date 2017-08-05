const baseDao = require('./baseDao')
const db = require('../database')

class classifyDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    const result = await db('recommends').select().innerJoin('products', 'products.id', 'recommends.product_id')
    return console.log(result, 'result')
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new classifyDao('classify', ['name', 'en_name', 'image_url'], 'sort')
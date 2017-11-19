/**
 * @api {GET, PUT, DELETE} /unique/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup Unique
 *
 * @apiParam {Number} id unique unique ID.
 *
 */

/**
 * @api {POST} /recommends
 * @apiName POST
 * @apiGroup Unique
 *
 * @apiParamExample {json} Request Example
 *   POST /api/unique/
 *   {
 *      list: [
 *        {product_id: 65, sort: 3},
 *        {product_id: 67, sort: 4},
 *      ]
 *   }
 */
const baseDao = require('./baseDao')
const db = require('../database')
const ORDER_LIMIT = 20
class uniqueDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async query(req, res, next) {
    try {
      let listQuery = db(`${this.db} as u`)
        .rightJoin(`products as p`, 'u.product_id', 'p.id')
        .select('p.name', 'p.image_url_mini', 'u.product_id', 'u.id', 'u.sort')
        .where({'u.status': 1}).orderBy('u.sort', 'desc')
      this.search.map(function (item) {
        if (req.query && req.query[ item ]) {
          listQuery = listQuery.where(`u.${item}`, req.query[ item ])
        }
      })
      const [ {count} ] = await listQuery.clone().count('u.id as count')
      let list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page - 1 : 0))
      res.set({'total-count': count}).status(200).json({status: 'ok', list: list})
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }
  async insert(req, res, next) {
    let { list } = req.body
    const result = await Promise.all(list.map(async item => await super.insert(req, res, next, item)))
    if (result) {
      res.json({status: 'ok'})
    }
  }
}

module.exports = new uniqueDao('unique', ['id', 'product_id'], 'sort')
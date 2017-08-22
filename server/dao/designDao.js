const baseDao = require('./baseDao')
const db = require('../database')
const ORDER_LIMIT = 20

class designDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }

  async query(req, res, next) {
    try {
      let listQuery = db(`${this.db} as d`)
        .rightJoin(`products as p`, 'd.product_id', 'p.id')
        .select('p.name', 'p.image_url_mini', 'd.product_id', 'd.id')
        .where({'d.status': 1}).orderBy('d.sort', 'desc')
      this.search.map(function (item) {
        if (req.query && req.query[ item ]) {
          listQuery = listQuery.where(`d.${item}`, req.query[ item ])
        }
      })
      const [ {count} ] = await listQuery.clone().count('d.id as count')
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

module.exports = new designDao('design',['id', 'product_id'], 'sort')

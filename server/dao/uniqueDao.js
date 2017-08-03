const baseDao = require('./baseDao')

class uniqueDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    let { productIds } = req.body
    productIds = productIds.split(/,|，|\b\n/g)
    const result = await Promise.all(productIds.map(async item => await super.insert(req, res, next, {product_id: +item, sort: +item})))
    if (result) {
      res.json({status: 'ok'})
    }
  }
}

module.exports = new uniqueDao('unique', ['id', 'product_id'], 'sort')
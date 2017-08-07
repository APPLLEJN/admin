const baseDao = require('./baseDao')
const db = require('../database')
const ORDER_LIMIT = 20

class productDao extends baseDao {
  constructor(db, search){
    super(db, search)
  }
  async query(req, res, next) {
    try {
      if (req.query.type){
        let typeName = req.query.type === 'recommend' ? 'recommends' : req.query.type
        let listQuery = db(`${this.db} as p`)
            .leftJoin(`${typeName} as t`, 't.product_id', 'p.id')
            .select('p.name', 'p.image_url_mini', 'p.id')
            .where({'p.status': 1, 't.product_id': null}).orderBy('p.create_time', 'desc')
        let list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page : 1 - 1))
        res.status(200).json({status: 'ok', list: list})
      } else {
        super.query(req, res, next)
      }
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }
}

module.exports = new productDao('products', ['name', 'en_name', 'image_url'])
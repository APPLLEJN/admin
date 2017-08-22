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
        let listQuery = db(this.db)
            .select().where('status', 1).orderBy('create_time', 'desc')
            .whereNotExists(function () {
              this.select('product_id').from(typeName).where('status', 1).whereRaw(`${typeName}.product_id=products.id`)
            })
        const [ {count} ] = await listQuery.clone().count('id as count')
        let list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page - 1 : 0))
        res.set({'total-count': count}).status(200).json({status: 'ok', list: list})
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
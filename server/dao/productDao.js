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
        if(req.query.type === 'unique') {
          const listQuery = db(`${this.db} as p`)
            .select().where('status', 1).orderBy('create_time', 'desc')
            .whereNotExists(function () {
              this.select('product_id').from('design').where('status', 1).whereRaw('design.product_id=p.id')
            })
            .whereNotExists(function () {
              this.select('product_id').from('unique').where('status', 1).whereRaw('unique.product_id=p.id')
            })
          const list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page - 1 : 0))
          res.status(200).json({status: 'ok', list: list})
        } else if (req.query.type === 'design') {
          const listQuery = db(`${this.db} as p`)
            .select().where('status', 1).whereNull('classify').orderBy('create_time', 'desc')
            .whereNotExists(function () {
              this.select('product_id').from('design').where('status', 1).whereRaw('design.product_id=p.id')
            })
          const list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page - 1 : 0))
          res.status(200).json({status: 'ok', list: list})
        } else if (req.query.type === 'recommend') {
          const seriesList = await db('series').select()
            .whereNotExists(function () {
              this.select('product_id').from('recommends').where('status', 1).whereRaw('recommends.product_id=series.id')
            }).limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.seriesPage - 1 : 0))
          const uniqueList = await db('unique as u').leftJoin('products as p', 'p.id', 'u.product_id')
            .select('p.id', 'p.name', 'p.image_url', 'p.image_url_mini').where('p.status', 1)
            .whereNotExists(function () {
              this.select('product_id').from('recommends').where('status', 1).whereRaw('recommends.product_id=u.product_id')
            }).limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.uniquePage - 1 : 0))
          res.status(200).json({status: 'ok', seriesList: seriesList, uniqueList: uniqueList})
        }
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
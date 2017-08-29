const baseDao = require('./baseDao')

class recommendDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async query(req, res, next) {
    // to do
    try {
      let listQuery = db(`unique as u`).select().unionAll(function () {
        this.select('*').from('series')
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

module.exports = new recommendDao('recommends', ['id', 'product_id'], 'sort')
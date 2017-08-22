const baseDao = require('./baseDao')

class recommendDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
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
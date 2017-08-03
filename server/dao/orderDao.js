const baseDao = require('./baseDao')

class orderDao extends baseDao {
  constructor(db, search){
    super(db, search)
  }
  async query(req, res, next) {
    await super.query(res, res, next, function (list) {
      list.forEach(function (item) {
        item.time_type = item.time_type.split(',').map(function (item) {
          return +item
        })
      })
      return list
    })
  }

  async insert(req, res, next) {
    const {username, date, time_type} = req.body
    await super.insert(req, res, next, {username, date, time_type: time_type.join(',')})
  }

  async update(req, res, next) {
    const {username, date, time_type} = req.body
    await super.update(req, res, next, {username, date, time_type: time_type.join(',')})
  }
}

module.exports = new orderDao('orders', ['username', 'phone', 'date'])
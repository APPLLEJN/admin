/**
 * @api {GET, PUT, DELETE} /order/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup Order
 *
 * @apiParam {Number} id order unique ID.
 *
 */

/**
 * @api {POST} /order
 * @apiName POST
 * @apiGroup Order
 *
 * @apiParamExample {json} Request Example
 *   POST /api/order/
 *   {
 *       date:"2017-09-21",
 *       phone:"17710133830",
 *       time_type: [1, 2],
 *       username:"test"
 *   }
 */

const baseDao = require('./baseDao')
const db = require('../database')

class orderDao extends baseDao {
  constructor(db, search){
    super(db, search)
  }
  async query(req, res, next) {
    await super.query(req, res, next, function (list) {
      list.forEach(function (item) {
        item.time_type = item.time_type.split(',').map(function (item) {
          return +item
        })
      })
      return list
    })
  }

  async insert(req, res, next) {
    try {
      const {username, date, phone, time_type} = req.body
      const list = await db(this.db).select().where({date: date, status: 1})
      let array = []
      list.map(item => {
        if (item.time_type.length > 1) {
          array=item.time_type.split(',')
        } else {
          if (time_type.indexOf(+item.time_type) > -1) {
            array.push(item.time_type)
          }
        }
      })
      if (array.length) {
        res.status(406).json({msg: '已经有预约信息！请重新选择！', time: array })
      } else {
        const result = await super.insert(req, res, next, {username: username, date: date, phone: phone, time_type: time_type.join(',')})
        if (result) {
          res.json({status: 'ok'})
        }
      }
    } catch (err) {
      console.log(err, 'err')
    }
  }

  async update(req, res, next) {
    const {username, date, phone, time_type} = req.body
    const {id} = req.params
    const list = await db(this.db).select().where({date, status: 1})
    let array = []
    list.map(item => {
      console.log(item, item.id, id, 'iiiii')
      if (item.id != id) {
        if (item.time_type.length > 1) {
          array=item.time_type.split(',')
        } else {
          if (time_type.indexOf(+item.time_type) > -1) {
            array.push(item.time_type)
          }
        }
      }
    })
    if (array.length) {
      res.status(406).json({msg: '已经有预约信息！请重新选择！', time: array })
    } else {
      await super.update(req, res, next, {username, date, phone, time_type: time_type.join(',')})
    }
  }
}

module.exports = new orderDao('orders', ['username', 'phone', 'date'])
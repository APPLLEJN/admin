/**
 * Created by jiangnan on 17/7/21.
 */
const db = require('../database')
const ORDER_LIMIT = 20

class baseDao {
  constructor(db, search, orderBy) {
    this.db = db;
    this.search = search
    this.orderBy = orderBy
  }

  async query(req, res, next ,cb) {
    try {
      let listQuery = db(this.db).select().where({status: 1}).orderBy(this.orderBy || 'create_time', 'desc')
      this.search.map(function (item) {
        if (req.query && req.query[ item ]) {
          listQuery = listQuery.where(item, req.query[ item ])
        }
      })
      const [ {count} ] = await listQuery.clone().count('id as count')
      let list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page : 1 - 1))
      if(typeof cb === 'function') {
        list = cb(list)
      }
      res.set({'total-count': count}).status(200).json({status: 'ok', list: list})
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }

  async get(req, res, cb) {
    try {
      const obj = await db(this.db).select().where({id: req.params.id, status: 1}).orderBy('create_time', 'desc')
      res.status(200).json(obj[0])
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }

  async insert (req, res, next, data) {
    try {
      const id = await db(this.db).insert(data || req.body)
      if (id && !data) {
        res.status(200).json({status: 'ok'})
      } else if (data) {
        return id
      }
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }
  async delete (req, res, next) {
    try {
      const id = await db(this.db).where({id: req.params.id}).update({status: 0})
      if (id) {
        res.status(200).json({status: 'ok'})
      }
    } catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }
  async update (req, res, next, data) {
    try {
      const id = await db(this.db).where({id: req.params.id}).update(data || req.body)
      if (id){
        res.status(200).json({status: 'ok'})
      }
    }catch (err) {
      console.log(err, 'error')
      res.status(404).json({status: 'failed', msg: err});
    }
  }
}

module.exports = baseDao
/**
 * @api {GET, PUT, DELETE} /classifies/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup Classifies
 *
 * @apiParam {Number} id classify unique ID.
 *
 */

/**
 * @api {POST} /classifies
 * @apiName POST
 * @apiGroup Classifies
 *
 * @apiParamExample {json} Request Example
 *   POST /api/classifies/
 *   {
 *     "data": {
 *       "name": "test",
 *       "en_name": "test",
 *       "image_url": "/upload/images/bg_s_r.png"
 *     }
 *   }
 */

const baseDao = require('./baseDao')
const db = require('../database')

class classifyDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new classifyDao('classify', ['name', 'en_name', 'image_url'], 'sort')
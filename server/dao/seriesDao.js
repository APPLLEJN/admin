/**
 * @api {GET, PUT, DELETE} /series/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup Series
 *
 * @apiParam {Number} id series unique ID.
 *
 */

/**
 * @api {POST} /series
 * @apiName POST
 * @apiGroup Series
 *
 * @apiParamExample {json} Request Example
 *   POST /api/series/
 *   {
 *       name: "test",
 *       en_name: "test",
 *       image_url: "/upload/images/bg_s_r.png"
 *   }
 */
const baseDao = require('./baseDao')
const db = require('../database')

class seriesDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new seriesDao('series', ['name', 'en_name', 'image_url', 'image_url_mini', 'description'], 'sort')
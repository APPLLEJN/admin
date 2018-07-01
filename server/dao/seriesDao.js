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
const ORDER_LIMIT = 20

class seriesDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async get(req, res, next) {
    //knex.select('*').from('users').whereNull('last_name').unionAll(function() {
    //   this.select('*').from('users').whereNull('first_name');
    // })
    if(req.query.isAll) {
        try {
            let listQuery = db(`child_series`).select('parent_id','name', 'id', 'image_url', 'sort').where({'parent_id': req.params.id, status: 1})
                .unionAll(function () {
                  this.select('parent_id', 'name', 'id', 'image_url', 'sort').from('products').where({'series': req.params.id, status: 1})
                }).orderBy('sort', 'desc')
            this.search.map(function (item) {
                if (req.query && req.query[ item ]) {
                    listQuery = listQuery.andWhere(`c.${item}`, req.query[ item ])
                }
            })
            const count = await listQuery.clone()
            let list = await listQuery.limit(ORDER_LIMIT).offset(ORDER_LIMIT * (req.query ? req.query.page - 1 : 0))
            res.set({'total-count': count.length}).status(200).json({status: 'ok', list: list})
        } catch (err) {
            console.log(err, 'error')
            res.status(404).json({status: 'failed', msg: err});
        }
    } else {
        super.get(req, res, next)
    }
  }
  async insert(req, res, next) {
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new seriesDao('series', ['name', 'en_name', 'image_url', 'image_url_mini', 'description'], 'sort')
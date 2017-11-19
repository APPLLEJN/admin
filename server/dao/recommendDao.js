/**
 * @api {GET, PUT, DELETE} /recommends/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup Recommends
 *
 * @apiParam {Number} id recommends unique ID.
 *
 */

/**
 * @api {POST} /recommends
 * @apiName POST
 * @apiGroup Recommends
 *
 * @apiParamExample {json} Request Example
 *   POST /api/recommends/
 *   {
 *      list: [
 *        {
   *        sort: 4,
   *        name: "产品名称",
   *        unique_id: 57,
   *        image_url: "/upload/images/d_3.png",
   *        type: "unique"
 *        },
 *        {
   *        sort: 5,
   *        name: "产品名称",
   *        series_id: 57,
   *        image_url: "/upload/images/d_3.png",
   *        type: "series"
 *        },
 *      ]
 *   }
 */
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
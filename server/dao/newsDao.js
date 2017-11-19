/**
 * @api {GET, PUT, DELETE} /news/[:id]
 * @apiName Get,Update,Delete
 * @apiGroup News
 *
 * @apiParam {Number} id news unique ID.
 *
 */

/**
 * @api {POST} /news
 * @apiName POST
 * @apiGroup News
 *
 * @apiParamExample {json} Request Example
 *   POST /api/news/
 *   {
 *     content:"<h1>标题</h1><h2>标题小呵呵</h2><p>正文</p><p><img src="http://admin.cigem.com.cn/upload/images/17375797081011046.png" alt="di_16" style="max-width: 100%;"></p><p>美不美！你就说美不美！惊不惊喜！意不意外！</p><p><br></p>",
 *     en_title:"wotianjiayigexinwenshishi",
 *     id:1,
 *     image_url:"/upload/images/demo-prodect.jpg",
 *     image_url_mini:"/upload/images/product_mini.png",
 *     sort:1,
 *     status:1,
 *     title:"我添加一个新闻试试"
 *   }
 */

const baseDao = require('./baseDao')
const db = require('../database')

class newsDao extends baseDao {
  constructor(db, search, orderBy){
    super(db, search, orderBy)
  }
  async insert(req, res, next) {
    const [{count}] = await db(this.db).select().where({status: 1}).count('id as count')
    req.body.sort = count +1
    super.insert(req, res, next)
  }
}

module.exports = new newsDao('news', ['title', 'en_title', 'content'], 'sort')
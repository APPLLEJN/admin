const baseDao = require('./baseDao')

//class classifyDao extends baseDao {
//  constructor(db, search){
//    super(db, search)
//  }
//}

module.exports = new baseDao('products', ['name', 'en_name', 'image_url'])
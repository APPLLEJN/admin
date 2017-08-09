const db = require('../database')
const cookieSecret = require('../../cigem/cookie-secret')
const config = require('../../cigem/config')

module.exports = {
  find: async function (req, res, next) {
      const user = await db('user').where({username: req.body.username})
      if (user.length && user[0].password === req.body.password){
        req.session.userToken = cookieSecret.encrypt(req.body.username + req.body.password, config.cookie_secret)
        res.json({ status: 'ok' });
      } else {
        res.status(403).json({
          status: 'failed',
          msg: '操作失败'
        });
      }
  }
};
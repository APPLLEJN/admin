const db = require('../database')

module.exports = {
  find: async function (req, res, next) {
      const user = await db('user').where({username: req.body.username})
      if (user.length && user[0].password === req.body.password){
        res.json({ status: 'ok' });
      } else {
        res.status(403).json({
          status: 'failed',
          msg: '操作失败'
        });
      }
  }
};
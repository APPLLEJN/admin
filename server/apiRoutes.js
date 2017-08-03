/**
 * Created by jiangnan on 17/7/15.
 */

const express = require("express");
const router = express.Router();
const userDao = require("./dao/userDao");
const orderDao = require("./dao/orderDao");
const classifyDao = require("./dao/classifyDao");
const seriesDao = require("./dao/seriesDao");
const productDao = require("./dao/productDao");
const newsDao = require("./dao/newsDao");
const recommendDao = require("./dao/recommendDao");
const uniqueDao = require("./dao/uniqueDao");
const designDao = require("./dao/designDao");
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var upload = require('./upload');

console.log(classifyDao.query, 'classifyDao.query')

router.post('/upload', multipartyMiddleware, upload.upload);

router.post('/login', (req,res,next) => userDao.find(req, res, next));

//订单
router.post('/order', (req,res,next) => orderDao.insert(req, res, next));
router.get('/order', (req,res,next) => orderDao.query(req, res, next));
router.delete('/order/:id', (req,res,next) => orderDao.delete(req, res, next));
router.put('/order/:id', (req,res,next) => orderDao.update(req, res, next));

//分类
router.get('/classifies', (req, res, next) => classifyDao.query(req, res, next))
router.get('/classifies/:id', (req, res, next) => classifyDao.get(req, res, next))
router.post('/classifies', (req, res, next) => classifyDao.insert(req, res, next))
router.put('/classifies/:id', (req, res, next) => classifyDao.update(req, res, next))
router.delete('/classifies/:id', (req,res,next) => classifyDao.delete(req, res, next));


//系列
router.get('/series', (req, res, next) => seriesDao.query(req, res, next))
router.get('/series/:id', (req, res, next) => seriesDao.get(req, res, next))
router.post('/series', (req, res, next) => seriesDao.insert(req, res, next))
router.put('/series/:id', (req, res, next) => seriesDao.update(req, res, next))
router.delete('/series/:id', (req,res,next) => seriesDao.delete(req, res, next));

//产品
router.get('/products', (req, res, next) => productDao.query(req, res, next))
router.get('/products/:id', (req, res, next) => productDao.get(req, res, next))
router.post('/products', (req, res, next) => productDao.insert(req, res, next))
router.put('/products/:id', (req, res, next) => productDao.update(req, res, next))
router.delete('/products/:id', (req,res,next) => productDao.delete(req, res, next));

//新闻
router.get('/news', (req, res, next) => newsDao.query(req, res, next))
router.get('/news/:id', (req, res, next) => newsDao.get(req, res, next))
router.post('/news', (req, res, next) => newsDao.insert(req, res, next))
router.put('/news/:id', (req, res, next) => newsDao.update(req, res, next))
router.delete('/news/:id', (req,res,next) => newsDao.delete(req, res, next));

//推荐
router.get('/recommends', (req, res, next) => recommendDao.query(req, res, next))
router.get('/recommends/:id', (req, res, next) => recommendDao.get(req, res, next))
router.post('/recommends', (req, res, next) => recommendDao.insert(req, res, next))
router.put('/recommends/:id', (req, res, next) => recommendDao.update(req, res, next))
router.delete('/recommends/:id', (req,res,next) => recommendDao.delete(req, res, next));

//单品
router.get('/unique', (req, res, next) => uniqueDao.query(req, res, next))
router.get('/unique/:id', (req, res, next) => uniqueDao.get(req, res, next))
router.post('/unique', (req, res, next) => uniqueDao.insert(req, res, next))
router.put('/unique/:id', (req, res, next) => uniqueDao.update(req, res, next))
router.delete('/unique/:id', (req,res,next) => uniqueDao.delete(req, res, next));

//私人定制
router.get('/design', (req, res, next) => designDao.query(req, res, next))
router.get('/design/:id', (req, res, next) => designDao.get(req, res, next))
router.post('/design', (req, res, next) => designDao.insert(req, res, next))
router.put('/design/:id', (req, res, next) => designDao.update(req, res, next))
router.delete('/design/:id', (req,res,next) => designDao.delete(req, res, next));

module.exports = router
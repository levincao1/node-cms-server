/**
 * Created by levin on 15/10/20.
 * 资讯相关api接口
 */
var express = require('express'),
    router = express.Router();

/**
 * @desc 获取资讯数据
 * @return {json} 资讯内容数据
 */
router.get('/zx/:id',function(req,res,next){
    res.json({content:'this is test content',from:'levin'});
    console.log('current pid:' + process.pid);
});

/**
 * @desc 记录资讯页的PV
 * @return {json} 记录状态
 */
router.get('/zx/pv',function(req,res,next){

});

/**
 * @desc 导入资讯数据
 * @return {json} 导入状态
 */
router.post('/zx/push',function(req,res,next){

});

module.exports = router;
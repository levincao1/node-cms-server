var express = require('express'),
    router = express.Router(),
    CtlPage = require('./../../server/controllers/ctl_page'),
    CtlItem = require('./../../server/controllers/ctl_item');



/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('fist page ------');
    var ctlItem = CtlItem.create();
    ctlItem.rootDirs().then(function(dirs){
        console.log(dirs);
        res.render('index', {title: 'levin'});
    }).fail(function(err){
        console.log(err);
        res.render('index', {title: 'err'});
    });
});
router.get('/zx/new', function(req, res, next) {
    console.log('fist page ------');
    var ctlPage = CtlPage.create();
    ctlPage.newPage().then(function(page){
        console.log(page);
        res.render('index', {title: 'levin'});
    }).fail(function(err){
        console.log(err);
        res.render('index', {title: 'err'});
    });
});

module.exports = router;

/**
 * Created by levin on 15/12/2.
 */
var util = require('util'),
    Q = require('q'),
    CtlBase = require('./../../server/controllers/ctl_base'),
    CtlItem = require('./../../server/controllers/ctl_item'),
    MPage= require('./../models/m_page');

var CtlPage = function(){
    this.Model = MPage;
    CtlBase.call(this);
};
util.inherits(CtlPage,CtlBase);

CtlPage.prototype.getPage = function(id){
    //this.render(req)
    //    .then(function(obj){
    //        console.log('first----->' + obj);
    //        var ctlItem = CtlItem.create();
    //        return ctlItem.rootDirs();
    //    }).then(function(obj){
    //        console.log('third----->' + obj);
    //        res.render('index', {title: 'levin'});
    //    }).fail(function(err){
    //        res.render('index', {title: 'levin'});
    //    });
};

CtlPage.prototype.newPage = function(){
    var opts = {
        parentid:2,
        guid:'http://sohu.com',
        gameid:23212,
        title:'cok1',
        author:'levin',
        from:'website',
        pkgname:'cok',
        keywords:'cok 列王的分争',
        description:'列王的分争',
        checked:0,
        showed:0
    };
    var mPage = this.Model.create(opts);
    return mPage.save();

};

module.exports = {
    create : function(){
        return new CtlPage();
    }
};
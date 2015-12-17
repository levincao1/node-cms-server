/**
 * Created by levin on 15/12/4.
 */
var util = require('util'),
    CtlBase = require('./../../server/controllers/ctl_base'),
    MItem= require('./../models/m_item');

var CtlItem = function(){
    this.Model = MItem;
    CtlBase.call(this);
};
util.inherits(CtlItem,CtlBase);

/**
 * @method rootDirs
 * @description Fetch all root directories
 * @returns {promise}
 */
CtlItem.prototype.rootDirs = function(){
    return this.Model.rootDirs();
};

CtlItem.prototype.subDirs = function(item,next){
    if(item instanceof MItem){
        item.subDirs(next);
    }
    next(null);
};
CtlItem.prototype.newItem = function(parenid,title,isroot,next){
    var item = new this.Model(parenid,title,isroot);
    item.save(next);
};

module.exports = {
    create : function(){
        return new CtlItem();
    }
};
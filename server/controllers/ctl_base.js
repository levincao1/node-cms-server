/**
 * Created by levin on 15/12/3.
 */
var util = require('util'),
    Q = require('q'),
    EventEmitter = require('events').EventEmitter;

var CtlBase = function(){
    EventEmitter.call(this);
};
util.inherits(CtlBase,EventEmitter);




CtlBase.prototype.send = function(req,res){
    if(this.validateUser()){

    }
};

CtlBase.prototype.validateUser = function(){
    return false;
};



module.exports = CtlBase;

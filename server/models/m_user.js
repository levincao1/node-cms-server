/**
 * Created by levin on 15/12/7.
 */
var dbAcc = require('./../../server/db_acc/acc').getDBPool();

var MUser = function(options){
    this.id = options.id || 0;
    this.username = options.username || '';
    this.name = options.name || '';
    this.password = options.password || '';
    this.level = options.level || '';
    this.badlogins = options.badlogins || 0;
    this.maxbadlogins = options.maxbadlogins || 4;
    this.active = options.active || 1;
    this.email = options.email || '';
    this.note = options.note || '';
};

MUser.prototype.getUser = function(session,next){

};


module.exports = {
    create : function(options){
        return new MUser(options);
    }
};
/**
 * Created by levin on 15/12/3.
 */
var dbAcc = require('./../../server/db_acc/acc').getDBPool();

var Item = require('./../../server/models/m_item');

var MPage = function(opts){
    opts = opts || {};
    this.itemid = opts.itemid || 0;
    this.parentid = opts.parentid || 0;
    this.guid = opts.guid || '';
    this.gameid = opts.gameid || 0;
    this.title = opts.title || '';
    this.author = opts.author || '';
    this.from = opts.from || '';
    this.pkgname = opts.pkgname || '';
    this.keywords = opts.keywords || '';
    this.description = opts.description || 0;
    this.checked = opts.checked || 0;
    this.showed = opts.showed || 0;
    this.createtime = opts.createtime || '';
    this.updatetime = opts.updatetime || '';
    this.stamp = opts.stamp || (new Date()).getTime();
};

MPage.prototype.save = function(){
    var self = this;
    params = [self.parentid,self.guid,self.gameid,self.title,self.author,self.from,self.pkgname,self.keywords,self.description,self.checked,self.showed,self.stamp];

    return dbAcc.transaction([
        function(msg){
            return dbAcc.query.call(msg.connection,'insert into items(parentid,isroot,title) values(?,?,?)',[self.parentid,0,self.title])
                .then(function(data){
                    return data;
                });
        },
        function(msg){
            var connection = msg.connection,
                okPacket = msg.info;
            params.unshift(okPacket.insertId);
            return dbAcc.query.call(connection,'insert into pages(itemid,parentid,guid,gameid,title,author,`from`,pkgname,keywords,description,checked,showed,createtime,updatetime,stamp) ' +
                'values(?,?,?,?,?,?,?,?,?,?,?,?,now(),now(),?)',params)
                .then(function(data){
                    self.itemid = okPacket.insertId;
                    return self;
                });
        }
    ]);
};


module.exports = {
    create : function(options){
        return new MPage(options);
    }
};
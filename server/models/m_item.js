/**
 * Created by levin on 15/11/30.
 */
var dbAcc = require('./../../server/db_acc/acc').getDBPool();

//根目录标识无父节点
var CONST_ROOT_FLAG = -1,
    //子目录标识无子节点
    CONST_SUB_FLAG = 0;

/**
 * @class MItem model class
 * @param data
 * @constructor
 */
var MItem = function(data){
    //Id
    this.id = data.id || '';
    //Parent id
    this.parentid = data.parentid||'';
    //Title or name
    this.title = data.title||'';
    //Is directory or news
    this.isroot = data.isroot||1;
    //Children numbers
    this.children = data.children || 0;
};

/**
 * @method subDirs
 * @description Fetch sub directories from one item;
 * @param id
 * @param next
 */
MItem.prototype.subDirs = function(id,next){
    var self = this,
        mItemArr = [];
    dbAcc.query('select id,parentid,isroot,title from items where parentid=?',id)
        .then(function(result){
            if (result) {
                result.forEach(function (data) {
                    var mItem = new MItem(data);
                    mItemArr.push(mItem);
                });
            }
            next(mItemArr);
        })
        .fail(function(err){
            console.log(err);
            next(mItemArr);
        });
};

/**
 * @method save
 * @description Save current object
 * @param next
 */
MItem.prototype.save = function(){
    var self = this,
        params = [
            self.parentid,
            self.isroot,
            self.title
        ];

    return dbAcc.query('insert into items(parentid,isroot,title) values(?,?,?)',params)
        .then(function(result){
            return result;
        })
        .fail(function(err){
            console.log(err);
            return err;
        });
};
/**
 * @method update
 * @description Update current object
 * @param next
 */
MItem.prototype.update = function(next){
    var self = this,
        isSuccess = false,
        params = [
            self.parentid,
            self.isroot,
            self.title,
            self.id
    ];
    dbAcc.query('update items set parentid=? ,isroot=? ,title=? where id=?',params)
        .then(function(result){
            if(result){
                isSuccess = true;
            }
            next(isSuccess);
        })
        .fail(function(err){
            console.log(err);
            next(isSuccess);
        });
};

/**
 * @method remove
 * @description Remove current object
 * @param next
 */
MItem.prototype.remove = function(next){
    var isSuccess = false;
    dbAcc.query('delete from items where id=?',this.id)
        .then(function(result){
            if(result){
                isSuccess = true;
            }
            next(isSuccess);
        })
        .fail(function(err){
            console.log(err);
            next(isSuccess);
        });
};

module.exports = {
    /**
     * @description Create instance by MItem
     * @param options
     * @returns {MItem}
     */
    create : function(options){
        return new MItem(options);
    },
    /**
     * @description Fetch root directories
     * @returns {*}
     */
    rootDirs : function() {
        var mItemArr = [];
        return dbAcc.query('select i1.id,i1.isroot,i1.parentid,i1.title,count(i2.id) as children from items i1 left join items i2 on i1.id=i2.parentid where i1.parentid=? group by i1.id', CONST_ROOT_FLAG)
            .then(function (result) {
                if (result) {
                    result.forEach(function (data) {
                        var mItem = new MItem(data);
                        mItemArr.push(mItem);
                    });
                }
                return mItemArr;
            })
            .fail(function (err) {
                console.log(err);
                return mItemArr;
            });
    }
};

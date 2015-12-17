/**
 * Created by levin on 15/11/30.
 */
var mysql = require('mysql'),
    util = require('util'),
    Q = require('q'),
    dbConf = require('./../config/dbConf.json');

/**
 * @class DBPool
 * @description Database connection pool
 * @param dbConf
 * @constructor
 */
var DBPool = function(dbConf){
    this.pool = null;
    this.init(dbConf);
    console.log('new DBPool-----');
};
/**
 * @method init
 * @description Initial function
 * @param dbConf
 */
DBPool.prototype.init = function(dbConf){
    if(!this.pool){
        this.pool = mysql.createPool(dbConf);
    }
};
/**
 * @method query
 * @description Execute query action on database pool
 * @param sqlStr
 * @param values
 * @returns {promise.promise|Function|jQuery.promise|*|d.promise|promise}
 */
DBPool.prototype.query = function(sqlStr,values){
    var client = (this instanceof DBPool)? this.pool : this,
        deffer = Q.defer();
    client.query(sqlStr,values,function(err,result){
        if(err){
            deffer.reject(err);
            return;
        }
        deffer.resolve(result);
    });
    return deffer.promise;
};

/**
 * @method transaction
 * @description Execute transaction action on database pool
 * @param queries
 * @returns {promise}
 */
DBPool.prototype.transaction = function(queries){
    var self = this;
    var deffer = Q.defer();
    //Fetch one connection
    self.pool.getConnection(function(err,_connection){
        if(err){
            //Release current connect when exception is occurred
            _connection.release();
            //The flow that through next pipeline is interrupted
            deffer.reject(err);
        }
        //There's a transaction that beginning for current connection
        _connection.beginTransaction(function(err){
            //Error is occurred
            if(err){
                _connection.release();
                deffer.reject(err);
                return;
            }
            //Initial promise object for beginning
            var q = Q(null);
            //Joined each query method by promise
            queries.forEach(function(queryFunc){
                //transfer fixed parameter after one query method was invoked
                q = q.then(function(_info){
                    return {
                        //Current connection,because every query method need it to invoke
                        connection:_connection,
                        //data of returns by query
                        info:_info
                    };
                }).then(queryFunc);
            });
            return q.then(function(result){
                //Commit
                _connection.commit(function(err){
                    if(err){
                        deffer.reject(err);
                    }
                    _connection.release();
                });
                deffer.resolve(result);
            }).catch(function(err){
                console.log(err);
                //Rollback
                _connection.rollback(function(){
                    _connection.release();
                });
                deffer.reject(err);
            });
        })
    });
    return deffer.promise;
};


//new obj of database connection pool
var dbPool = null;

module.exports = {
    getDBPool : function(){
        if(!dbPool){
            //new obj of database connection pool
            dbPool =  new DBPool(dbConf);
        }
        return dbPool;
    }
};

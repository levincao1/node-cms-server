/**
 * Created by levin on 15/11/9.
 */
var net = require('net'),
    path = require('path'),
    Q = require('q'),
    mstore = require('./../../server/mistore_acc/mstore');

//常量
var CONST_HOST = '10.98.80.16',
    CONST_PORT = 9001,
    CONST_APPID = 9999,
    //连接间隔时间
    CONST_TIMEOUT =  500,
    //最大连接间隔时间
    CONST_MAXTIMEOUT = 16000;

var socketConnectInterTime = CONST_TIMEOUT;

/**
 * @class SocketClient 长连接接口管理类
 * @param host
 * @param port
 * @constructor
 */
var SocketClient = function(host,port){
    this.client = null;
    this.__subClient = null;
    this.host = host;
    this.port = port;
    //promise管道，用来管理输入输出流程
    this.deffered = Q.defer();
    this.init();
};

/**
 * @method init 初始化方法
 */
SocketClient.prototype.init = function(){
    var self = this;
    //创建客户端socket
    self.__subClient = new net.Socket();
    self.client = this.__subClient;
    //激活方法
    var activateFuc = function(){
        process.nextTick(function(){
            self.client.destroy();
            var newClient = new SocketClient(self.host,self.port);
            socketConnectInterTime *= 2;
            newClient.connectServer();
        });
    };
    //socket关闭事件
    self.__subClient.on('close',function(){
        if(socketConnectInterTime > CONST_MAXTIMEOUT){
            console.log('connection error : the last connection time is :' + socketConnectInterTime);
            return ;
        }
        console.log('connection error : socket connection is closed! interval time is : ' + socketConnectInterTime);
        setTimeout(function(){
            activateFuc();
        },socketConnectInterTime);
    });
    //socket获取数据事件
    self.__subClient.on('data',function(data){
        //promise管道输出
        self.deffered.resolve(data);
    });
    //socket出错事件
    self.__subClient.on('error',function(err){
        console.log('socket connection error is occurred! error data is : ' + err);
        //promise管道出现错误
        self.deffered.reject(err);
    });
};

/**
 * @method connectServer 客户端发起连接server
 */
SocketClient.prototype.connectServer = function(){
    var self = this;
    self.__subClient.connect(self.port,self.host,function(){
        socketConnectInterTime = CONST_TIMEOUT;
        console.log('connect to : ' + self.host + ' : ' + self.port);
    });
};

/**
 * @description socket连接正常的情况下，发送请求数据包
 * @method sendReq
 * @param pkg
 * @returns {promise} 返回promise类型，可放置接收响应方法在此对象的then方法中。
 */
SocketClient.prototype.sendReq = function(pkg){
    this.__subClient.write(pkg);
    //返回一个promise管道对象
    return this.deffered.promise;
};

//创建客户端对象
var client = new SocketClient(CONST_HOST,CONST_PORT);


module.exports = {
    /**
     * @description ACC API的初始化方法，主要功能连接服务端
     */
    init : function(){
        client.connectServer();
    },
    /**
     * @description 从redis中根据key读取value
     * @param _key
     * @param _next
     */
    get : function(_key,_next){
        var buf = mstore.createReqBuf('mstore.get',{appId:CONST_APPID,key:_key});

        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.get',data);
            _next && _next(busi);
        })
    },
    /**
     * @description 从mySql中获取已存在key的数据中的timestamp，用来根据timestamp更新数据以保证数据的原子性
     * @param _key
     * @param _next
     */
    getAll : function(_key,_next){
        var buf = mstore.createReqBuf('mstore.getall',{appId:CONST_APPID,key:_key});

        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.getall',data);
            _next && _next(busi);
        });

    },

    /**
     * @description 批量从redis库里获取数据
     * @param key
     * @param next
     */
    multiGet : function(key,next){
        var buf = mstore.createReqBuf('mstore.multiget',{appId:CONST_APPID,key:_key});

        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.multiget',data);
            _next && _next(busi);
        });

    },

    /**
     * @description 向mysql库里写入数据
     * @param _key
     * @param _val
     * @param _next
     */
    set : function(_key,_val,_next){
        var buf = mstore.createReqBuf('mstore.set',{
            appId:CONST_APPID,
            key:_key,
            value:_val,
            stamp:(new Date()).getTime()
        });

        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.set',data);
            _next && _next(busi);
        })

    },
    /**
     * @description 删除mysql或redis库的数据
     * @param _key
     * @param _next
     */
    del : function(_key,_next){
        var buf = mstore.createReqBuf('mstore.del',{appId:CONST_APPID,key:_key});
        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.del',data);
            _next && _next(busi);
        });

    },

    /**
     * @description 设置数据的过期时间，自增等特性，仅限redis
     * @param _key
     * @param _option
     * @param _opt_val
     * @param _next
     */
    setOption : function(_key,_option,_opt_val,_next){
        var buf = mstore.createReqBuf('mstore.setoption',{appId:CONST_APPID,key:_key,option:_option,opt_value:_opt_val});
        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.setoption',data);
            _next && _next(busi);
        });
    },

    /**
     * @description 获取数据的过期时间，自增等性性，仅限redis
     * @param _key
     * @param _next
     */
    getOption : function(_key,_next){
        var buf = mstore.createReqBuf('mstore.getoption',{appId:CONST_APPID,key:_key});
        client.sendReq(buf).then(function(data){
            var busi = mstore.parseRespBuf('mstore.getoption',data);
            _next && _next(busi);
        });
    }

};

/**
 * Created by levin on 15/11/10.
 */
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    ProtoBuf = require('protobufjs'),
    byteOrder = require('network-byte-order'),

    ByteBuffer = ProtoBuf.ByteBuffer,

    //请求PB结构类
    reqPBStr = fs.readFileSync(path.join(__dirname, 'mi_store_req.proto')).toString(),
    reqPB = ProtoBuf.loadProto(reqPBStr).build('MIStore'),

    //响应PB结构类
    respPBStr = fs.readFileSync(path.join(__dirname, 'mi_store_resp.proto')).toString(),
    respPB = ProtoBuf.loadProto(respPBStr).build('MIStore'),

    //操作命令PB结构类（也就是busibuff中的PB结构）
    cmdPBStr = fs.readFileSync(path.join(__dirname, 'mi_store_cmd.proto')).toString(),
    cmdPB = ProtoBuf.loadProto(cmdPBStr).build('MIStore');

//包基本字段字节数
var CONST_BASE_BYTES = 25;

/**
 * @description 生成请求包buffer
 * @param cmd
 * @param params
 * @param next
 * @return buffer
 */
var generateReqBuf = function(cmd,params,next){
    if(!cmd){
        return null;
    }
    var reqBuf = new Buffer(CONST_BASE_BYTES - 1),
        iLen,totalLen,offset;
    iLen = offset = totalLen = 0;

    var bodyBuf = reqPacket(cmd,params);
    //超始符
    iLen = reqBuf.writeUInt8(0x06,offset);

    //版本号
    offset = iLen;
    iLen = reqBuf.writeUInt8(0,offset);

    //命令符
    offset = iLen;
    iLen = reqBuf.writeUInt32BE(1,offset);
    //转换网络字节序
    byteOrder.htonl(reqBuf,offset,1);

    //checksum
    offset = iLen;
    iLen = reqBuf.writeUInt16BE(0,offset);
    //转换网络字节序
    byteOrder.htons(reqBuf,offset,0);

    //seq
    offset = iLen;
    iLen = reqBuf.writeUInt32BE(0,offset);
    //转换网络字节序
    byteOrder.htonl(reqBuf,offset,0);

    //key
    offset = iLen;
    iLen = reqBuf.writeUInt32BE(0,offset);
    //转换网络字节序
    byteOrder.htonl(reqBuf,offset,0);

    //response_flag
    offset = iLen;
    iLen = reqBuf.writeUInt8(0,offset);

    //response_info
    offset = iLen;
    iLen = reqBuf.writeUInt16BE(0,offset);
    //转换网络字节序
    byteOrder.htons(reqBuf,offset,0);

    //reserved
    offset = iLen;
    iLen = reqBuf.writeUInt8(0,offset);

    //包基本字节数与包体PB结构总字节长的和
    totalLen = CONST_BASE_BYTES + bodyBuf.length;

    //包字节数总长
    offset = iLen;
    reqBuf.writeUInt32BE(totalLen,offset);
    console.log('len offset is : ' + offset);
    //转换网络字节序
    byteOrder.htonl(reqBuf,offset,totalLen);

    //合并生成新buffer
    var resultBuf = Buffer.concat([reqBuf,bodyBuf],totalLen);

    //结束符
    offset = totalLen - 1;
    resultBuf.writeUInt8(0x08,offset);

    return resultBuf;
};

/**
 * @description 构造请求包体
 * @param cmd
 * @param param
 * @returns {!Buffer|*}
 */
var reqPacket = function(cmd,param){
    var reqPacket = new reqPB.StoreReqPacket();
    reqPacket.set('appId',param.appId);
    reqPacket.set('serviceCmd',cmd);
    var busiBufStr = reqBusi(cmd,param);
    reqPacket.set('busiBuff',busiBufStr);
    return reqPacket.encode().toBuffer();
};

/**
 * @description 构造BusiBuff
 * @param cmd 操作命令
 * @param param
 * @returns {Buffer}
 */
var reqBusi = function(cmd,param){
    var _instance;
    switch(cmd){
        case 'mstore.get':
            _instance = new cmdPB.GetDataReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_key',ByteBuffer.wrap(param.key));
            break;
        case 'mstore.getall':
            _instance = new cmdPB.GetDataReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_key',param.key);
            break;
        case 'mstore.multiget':
            _instance = new cmdPB.MultiGetDataReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_key',param.key);
            break;
        case 'mstore.set':
            _instance = new cmdPB.SetDataReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_key',ByteBuffer.wrap(param.key));
            _instance.set('ms_value',ByteBuffer.wrap(param.value));
            _instance.set('ms_timestamp',param.stamp);
            break;
        case 'mstore.del':
            _instance = new cmdPB.DelDataReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_key',ByteBuffer.wrap(param.key));
            break;
        case 'mstore.setoption':
            _instance = new cmdPB.SetOptionReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_option',param.option);
            _instance.set('ms_key',param.key);
            _instance.set('ms_opt_value',param.opt_val);
            break;
        case 'mstore.getoption':
            _instance = new cmdPB.GetOptionReq();
            _instance.set('ms_app_id',param.appId);
            _instance.set('ms_option',param.option);
            _instance.set('ms_key',param.key);
            break;
    }
    //console.log('req busiBuff PB structure is : ');
    //console.log(_instance);
    //
    //console.log('req busiBuff buffer is : ');
    //console.log(_instance.encode().toBuffer());

    return _instance.encode().toBuffer();
};


/**
 * @description 解析响应包
 * @param cmd 操作命令
 * @param data 二进制响应数据
 */
var parseRespBuf = function(cmd,data){
    if(!data || !Buffer.isBuffer(data)){
        return;
    }
    //将网格字节序转为本地字节序
    byteOrder.ntohl(data,CONST_BASE_BYTES - 5);
    var len = data.readUInt32BE(CONST_BASE_BYTES - 5);
    var result = data.slice(24,len - 1);
    return respPacket(cmd,result);
};

/**
 * @description 从响应包中提取数据
 * @param cmd 操作命令
 * @param buf 要解析的数据，类型buffer
 * @returns {object} 响应数据
 */
var respPacket = function(cmd,buf){
    if(!buf){
        return null;
    }

    var result = respPB.StoreRespPacket.decode(buf);
    console.log('errMsg : ' + result.get('errMsg'));
    var busiBuff = result.get('busiBuff');
    if(!busiBuff){
        return null;
    }
    var busiMsg = respBusi(cmd,busiBuff.toBuffer());
    var respMsg =  parseVal(busiMsg);
    //console.log('value : ' + respMsg['ms_value']);
    return respMsg;
};

/**
 * @description 根据操作命令解析busiBuff结构数据
 * @param cmd 操作命令
 * @param buf 要解析的数据，类型buffer
 * @returns {*}
 */
var respBusi = function(cmd,buf){
    if(!buf){
        return null;
    }
    var _class;
    switch(cmd){
        case 'mstore.get':
            _class = cmdPB.GetDataResp;
            break;
        case 'mstore.getall':
            _class = cmdPB.GetDataResp;
            break;
        case 'mstore.multiget':
            _class = cmdPB.MultiGetDataResp;
            break;
        case 'mstore.set':
            _class = cmdPB.SetDataResp;
            break;
        case 'mstore.del':
            _class = cmdPB.DelDataResp;
            break;
        case 'mstore.setoption':
            _class = cmdPB.SetOptionResp;
            break;
        case 'mstore.getoption':
            _class = cmdPB.GetOptionResp;
            break;
    }
    return _class.decode(buf);

};

/**
 * @description 解析Bytes类型的数据
 * @param obj
 * @returns {*}
 */
var parseVal = function(obj){
    if(!obj){
        return null;
    }
    var __obj = {},__val = null;
    for(key in obj){
        if(!obj.hasOwnProperty(key)){
            continue;
        }
        if(ByteBuffer.isByteBuffer(obj[key])){
            __val = obj[key].toBuffer().toString('utf8',0);
            //如果是对象类型
            if(util.isObject(__val)){
                //递归调用继续解析
                __obj[key] = parseVal(__val);
                continue;
            }
            //字符类型
            __obj[key] = __val;
            continue;
        }
        //非byteBuffer类型
        __obj[key] = obj[key];
    }
    return __obj;
};

module.exports = {
    /**
     * @description 创建请求数据结构
     * @param cmd 操作命令
     * @param params
     * @param next
     * @returns {buffer}
     */
    createReqBuf : function(cmd,params,next){
        return generateReqBuf(cmd,params,next);
    },

    /**
     * @description 解析响应数据结构
     * @param cmd
     * @param data
     * @param next
     */
    parseRespBuf : function(cmd,data,next){
        return parseRespBuf(cmd,data);
    }

};
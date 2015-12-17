#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./server/app');
var debug = require('debug')('migc-cms-zx:server');
var http = require('http');

//var communicate = require('../server/mistore_acc/communicate');
var accApi = require('./server/mistore_acc/api');

var cluster = require('cluster'),
    numCPUs = require('os').cpus().length;

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

//var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

//server.listen(port);
//server.on('error', onError);
//server.on('listening', onListening);

if(cluster.isMaster){
    for(var i=0;i<numCPUs;i++){
        cluster.fork();
    }
    cluster.on('exit',function(worker,code,signal){
       console.log('worker ' + worker.process.pid +' died');
    });
    cluster.on('listening', function(worker, address) {
        console.log("A worker"+worker.process.pid+" is now connected to " + address.address + ":" + address.port);
    });
}else{
    var server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    console.log('child pid:' + process.pid);

}

//accApi.init();

var key = 'levin_1';
var val = 'first data is ok  111!';

var cb = function(obj){
    console.log('receive-data :' + JSON.stringify(obj));
};

//写数据
//setTimeout(function(){
//    accApi.set(key,val,cb);
//},500);


////读数据
//setTimeout(function(){
//    accApi.get(key,cb);
//},1000);


////从MySql中获取timestamp
//setTimeout(function(){
//    accApi.getAll(key,cb);
//},1000);

////删除数据
//setTimeout(function(){
//    accApi.del(key,cb);
//},1000);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('--->Listening on ' + bind);
}

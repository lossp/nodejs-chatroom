
var fs = require('fs');//内置的fs模块用来提供与文件系统相关的功能
var path = require('path');
var mime = require('mime');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express')

var chatServer = require('./lib/chat_server');
chatServer.listen(http)

var cache = {};//用来缓存文件内容的对象

//发送文件数据以及错误响应
function send404(res){
    res.writeHead(404, {'Content-Type':'text/plain'})
    res.write('Erro 404: resource not found.')
    res.end();
}
function sendFile(res, filePath, fileContents){
    res.writeHead(200, { 'content-type': mime.getType(path.basename(filePath)) });
    res.end(fileContents)
}

//提供静态文件服务
function serverStatic(res, cache, absPath){
    //检查文件是否存在于缓存中
    if(cache[absPath]){
        sendFile(res, absPath, cache[absPath]);//如果存在，直接从内存中返回文件
    }else{
        fs.exists(absPath,function(exists){  //检查文件是否存在
            if(exists){
                fs.readFile(absPath, function(err, data){ //从硬盘中读取文件
                    if(err){
                        send404(res);
                    }else{
                        cache[absPath] = data;
                        sendFile(res, absPath, data);  //从硬盘中读取并且返回
                    }
                });
            }else{
                send404(res);
            }
        })
    }
}

//创建http服务器逻辑
app.use(express.static('./public'))

http.listen(3000, function(){
    console.log('server listening to port 3000')
})
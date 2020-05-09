var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(__dirname+"/"))

let clients = 0

io.on('connection', function(socket){

socket.on('userconnected', function(data){
 clients++
    if(clients <3){
if(clients == 2) {

    this.emit('sendOffer')
}

    }
else{

    this.emit('sessionActive')
}

})

socket.on('sendingOffer', function(data){
this.broadcast.emit('broadcastingOffer',data)

})

socket.on('answer', function(data){
this.broadcast.emit('response',data)

})

socket.on('disconnect', function(){
    clients--
    this.emit('disconnectingvideo')
})

socket.on('messages',function(data){
    io.sockets.emit('broadcastmessage',data)
})

})

var server = http.listen(3000, ()=>{

var host = server.address().address
var port = server.address().port

console.log('listening at port'+port+" and host "+host)
})
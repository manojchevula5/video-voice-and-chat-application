# video-voice-and-chat-application

sudo apt-get install node.js //install node.js package in your machine

use npm init // to create package.json file


index.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video-Voice and Chat application</title>
     <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'>
</head>
<body>
    <div class="container-fluid">
        <div class="row h-90 w-100">
            <div class="col-12 col-sm-6 d-flex justify-content-center">
                <div class="embed-responsive embed-responsive-16by9">
                    <video class='embed-responsive-item'></video>
                </div>

            </div>
            <div class="col-12 col-sm-6 d-flex justify-content-center">
                <div id='peerDiv' class="embed-responsive embed-responsive-16by9">

                </div>
            </div>
            <div class="col-12 col-sm-6 d-flex justify-content-start">
                <div id='messagediv' class="embed-responsive embed-responsive-16by9">
                    <input id='messagedata' type='text' value=" ">
                    <button id='messagebutton' type='submit'> send message</button>
                    <div id='messagedisplay'></div>
                </div>
            </div>

        </div>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script src="bundle.js"></script>
</body>
</html>

main.js

let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
let client = {}

navigator.mediaDevices.getUserMedia({video:true, audio:true})
.then(stream => {

    socket.emit('userconnected')
    video.srcObject = stream
    video.play()

    function InitialisingPeer(type){

        let peer = new Peer({initiator:(type=='init')?true:false, stream : stream , trickle: false})
        
            peer.on('stream', function(stream){
            createVideo(stream)

            })

            peer.on('data',(data)=>{
                console.log("peer2 message data")
                peer.send('hi this is peer 2')
            })
     
            return peer
    }
            function createVideo(stream){
                var video = document.createElement('video')
                video.id='peerVideo'
                video.setAttribute=('class','embed-responsive-item')
                video.srcObject = stream
                document.querySelector('#peerDiv').appendChild(video)
                video.play()
            }

     socket.on('sendOffer',sendOffer)
    function sendOffer(){
        client.gotAnswer = false
        let peer = InitialisingPeer('init')
        peer.on('signal', function(data){
            socket.emit('sendingOffer',data)

        })
        client.peer = peer
        peer.on('data',(data)=>{
            console.log('peer 1 message' + data )
            peer.send('this is peer 1')
        })
    }

    socket.on('broadcastingOffer',receiveOffer)
    function receiveOffer(data){
     let peer = InitialisingPeer('notinit')
     peer.on('signal', function(data){

            socket.emit('answer',data)
     })

     peer.signal(data)
      client.peer = peer
    }

    socket.on('response',response)
function response(data){
client.gotAnswer = true
let peer = client.peer
peer.signal(data)

}

socket.on('sessionActive',sessionActive)

function sessionActive(){
    document.write('the house is full, come back later')
}

socket.on('disconnectingvideo',dvideo)
function dvideo(){
    peer.remove()
    }

//messaging feature

document.querySelector('#messagebutton').addEventListener('click',function(){
 socket.emit('messages',{message:document.getElementById("messagedata").value, name:document.querySelector('video').peer} )
})

socket.on('broadcastmessage', function(data){

document.querySelector('#messagedisplay').innerHTML += "<div><br>"+data.name+":"+data.message+"</br>"+"</div>" 

})


})
.catch(err => document.write(err))







server.js

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

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
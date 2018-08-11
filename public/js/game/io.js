var socket = io('/game');

//obrisi kasnije
socket.on('connect',function(){
    console.log('Connected to server');
});
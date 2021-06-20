const protocol = require('./protocol');

const net = require('net');
const server = net.createServer();

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const moment = require('moment');

var musicians = new Map();

function addMusician(msg, source){
    console.log("Message " + msg + " from " + source);

    let jsonData = JSON.parse(msg);

    var musician = musicians.get(jsonData.uuid);
    musician.lastActive = moment();
    musicians.set(jsonData.uuid, musician)
}


function getActiveMusicians(){
    var list = [];
    var now = moment();
    musicians.forEach(function (value, key){
        if(now - value.lastActive  < 5000){
            list.push({uuid: key, instrument: value.instrument, firstActive: value.firstActive.utcOffset(+120).format()})
        } else {
            musicians.delete(key);
        }
    });
    return list;
}

socket.bind(protocol.PROTOCOL_PORT, function (){
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

socket.on('message', function(msg, source){
    addMusician(msg, source)
});

function connect(tcpSocket){
    console.log("New TCP connection");
    var activeMusicians = getActiveMusicians();
    tcpSocket.write(JSON.stringify(activeMusicians));
    tcpSocket.destroy();
}


server.listen(protocol.TCP_PORT, function (){
    console.log("Listening on port " + protocol.TCP_PORT);
});

server.on('connection', function(tcpSocket){
    connect(tcpSocket)
});
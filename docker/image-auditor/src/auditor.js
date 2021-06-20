const protocol = require('./protocol');

const net = require('net');
const server = net.createServer();

const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const moment = require('moment');

const sounds = [
    ["ti-ta-ti", "piano"],
    ["pouet", "trumpet"],
    ["trulu", "flute"],
    ["gzi-gzi", "violin"],
    ["boum-boum", "drum"]
];

var musicians = new Map();
const instruments = new Map(sounds);

socket.bind(protocol.PROTOCOL_PORT, function (){
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});


function addSound(msg, source){
    console.log("Message " + msg + " from " + source);

    let jsonData = JSON.parse(msg);

    let musician = {
        instrument: instruments.get(jsonData.sound),
        firstActive: instruments.has(jsonData.uuid) ? instruments.get(jsonData.uuid).firstActive : moment(),
        lastActive: moment()
    }
    musicians.set(jsonData.uuid, musician)
}

socket.on('message', addSound);

server.listen(protocol.TCP_PORT, function (){
    console.log("Listening on port " + protocol.TCP_PORT);
});

function getActiveMusicians(){
    var list = [];
    musicians.forEach(function (value, key){
        if(moment() - value.lastActive  < 5000){
            list.push({uuid: key, instrument: value.instrument, firstActive: value.firstActive.utcOffset(+120).format()})
        } else {
            musicians.delete(key);
        }
    });
    return list;
}

function connect(tcpSocket){
    console.log("New TCP connection");
    let activeMusicians = getActiveMusicians();
    tcpSocket.write(JSON.stringify(activeMusicians));
    tcpSocket.end();
}

server.on('connection', connect);
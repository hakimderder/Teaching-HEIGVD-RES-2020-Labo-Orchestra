const protocol = require('./protocol');

const net = require('net');

const dgram = require('dgram');
const socketUdp = dgram.createSocket('udp4');

const moment = require('moment');

const musicians = new Map();

const instruments = new Map([
    ["ti-ta-ti",  "piano"],
    ["pouet",     "trumpet"],
    ["trulu",     "flute"],
    ["gzi-gzi",   "violin"],
    ["boum-boum", "drum"]
]);

const server = net.createServer();

function sendActiveMusicians(socketUdp){
    var list = [];

    musicians.forEach((musician) => {
        if(moment(Date.now()).diff(musician.lastActive, 'seconds') <= 5){
            list.push(musician);
        }else {
            musicians.delete(musician);
        }
    })
    socketUdp.write(JSON.stringify(list));
    socketUdp.write('\n');
    socketUdp.end();
}

server.listen(protocol.TCP_PORT);
server.on('connection', sendActiveMusicians);

socketUdp.bind(protocol.PROTOCOL_PORT, function (){
    console.log("Joining multicast group");
    socketUdp.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

socketUdp.on('message', function(msg, source){
    console.log("Message " + msg + " from " + source);
    let jsonData = JSON.parse(msg);
    let musician = {
        uuid: jsonData.uuid,
        instrument: instruments.get(jsonData.sound),
        firstActive: musicians.has(jsonData.uuid) ? musicians.get(jsonData.uuid).firstActive : moment(),
        lastActive: moment()
    };
    musicians.set(jsonData.uuid, musician);
});



	
// var uuid = require('uuid');
const {v4: uuidv4} = require('uuid');
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
const uuid = uuidv4();
const protocol = require('./protocol');
const SOUNDS = new Map();
SOUNDS.set("piano", "ti-ta-ti");
SOUNDS.set("trumpet", "pouet");
SOUNDS.set("flute", "trulu");
SOUNDS.set("violin", "gzi-gzi");
SOUNDS.set("drum", "boum-boum");
function sendMusician() {
    let musician = {
        uuid: uuid,
        sound: protocol[instrument]
    };
    const msg = JSON.stringify(musician);
    socket.send(msg, 0, msg.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS,
        function (error, bytes) {
            console.log("Sending payload: " + msg + " via port " + socket.address().port);
    });
}

if (process.argv.length < 3) {
    console.log("Need an instrument");
    process.exit();
}
const instrument = process.argv[2];

setInterval(sendMusician, 1000);



// var uuid = require('uuid');
const {v4: uuidv4} = require ('uuid');
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

const protocol = require('./protocol');

function Musician(instrument, uuid){
        this.instrument = instrument;
        this.uuid = uuid;

        var infos = {
            uuid: this.uuid,
            sound: protocol[instrument]
        };
        var payload = JSON.stringify(infos);
        var message = Buffer.from(payload)

        Musician.prototype.update = function(){
            socket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS,
                function (error, bytes){
                console.log("Sending payload: " + payload + " via port " + socket.address().port);
                });
        }

        setInterval(this.update.bind(this), 1000);
}

if(process.argv.length < 3){
    console.log("Need an instrument");
    process.exit();
}
var instrument = process.argv[2];

var musician = new Musician(instrument, uuidv4);
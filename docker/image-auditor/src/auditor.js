
/**
 * The specification of the app
 */
const protocol = require('./auditor-protocol');

/**
 * The map of musicians alive
 */
const musicians = new Map();

/**
 * The map of instruments with their sound as key and name as value
 */
const instruments = new Map(protocol.INSTRUMENTS);

/**
 * The time can be alive witouth sending sound
 */
const INTERVAL_UNTIL_DEATH = 5000;


//#region UDP

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const udpSocket = dgram.createSocket('udp4');
udpSocket.bind(protocol.PROTOCOL_PORT, function () {
    console.log("Joining multicast group");
    udpSocket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});


/**
 * Update the map of musicians with sound received
 * @param {*} msg The sound of the instrument, and the uuid of the musician
 * @param {*} source /
 */
function receiveSound(msg, source) {
    console.log("Data has arrived: " + msg + ". Source port: " + source.port);

    let tmp = JSON.parse(msg);

    let musician = {
        instrument: instruments.get(tmp.sound),
        activeSince: instruments.has(tmp.uuid) ? instruments.get(tmp.uuid).activeSince : moment(),
        lastActivity: moment()
    }

    musicians.set(tmp.uuid, musician);

}

/* 
 * This call back is invoked when a new datagram has arrived.
 */
udpSocket.on('message', receiveSound);

//#endregion

//#region TCP

/**
 * Let's create a TCP socket
 */
const net = require('net');
const moment = require('moment');

const tcpServer = net.createServer();

tcpServer.listen(protocol.TCP_PORT);

/**
 * Send a JSON payload of all musicians alive
 * @param {*} socket
 */
function tcpConnect(socket) {
    let time = moment();

    let msg = JSON.stringify([...musicians].filter(([key, value]) => {
        // Remove inactive musician
        if (time.diff(value.lastActivity) > INTERVAL_UNTIL_DEATH) {
            console.log("Remove inactive musician: ", key);
            musicians.delete(key);
            return false;
        }

        return true;
        // Map appropriate values for the exportation
    }).map(([key, value]) => {
        return { uuid: key, instrument: value.instrument, activeSince: value.lastActivity.format() };
    }));

    socket.write(msg);
    socket.write("\n");
    socket.end();
}

tcpServer.on("connection", tcpConnect);

//#endregion
var SerialPort = require("serialport");
var io = require('socket.io-client');

var config = process.env.NODE_ENV === "dev" ? require("./config") : require("./config.production");

// Open port to board
var port = new SerialPort(config.serialPort, {
  baudRate: 57600,
  parser: SerialPort.parsers.readline('\n')
});

// Listen to commands from stdin for debugging (kind of like a REPL)
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
    const data = d.toString().trim();
    port.write(data + '\n', function(err) {
        if (err) {
            return log('Error on write: ', err.message);
        }
    });
});

// Connect to FeederServer using a websocket
log("Connecting to FeederServer at " + config.serverUrl);
var socket = io.connect(config.serverUrl, {
    reconnect: true,
    query: { key: config.key }
});

// Add a connect listener
socket.on('connect', function () {
    log("Established a valid connection to FeederServer");

    socket.on('feed', function (from, msg) {
        log("Recieved request to feed...");
        log("Sending feed command to board");

        port.write('feed\n', function(err) {
            if (err) {
                log('Error on write: ', err.message);
                return;
            }
        });
    });
});

port.on('open', function() {
    log("Opened port to board...");
});


port.on('data', function (d) {
    const data = d.toString().trim();

    if(data == "ready-for-commands"){
        log("Board is ready for commands...");
    }
});

// open errors will be emitted as an error event
port.on('error', function(err) {
    log('Error: ', err.message);
});

function log(){
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(this, [">"].concat(args));
}
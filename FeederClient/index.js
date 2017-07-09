var SerialPort = require("serialport");
var io = require('socket.io-client');

var config = process.env.NODE_EV === "development" ? require("./config") : require("./config.production");

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
            return console.log('Error on write: ', err.message);
        }
    });
});

// Connect to FeederServer using a websocket
console.log("> Connecting to FeederServer at " + config.serverUrl);
var socket = io.connect(config.serverUrl, {
    reconnect: true,
    query: { key: config.key }
});

// Add a connect listener
socket.on('connect', function () {
    console.log("> Established a valid connection to FeederServer");

    socket.on('feed', function (from, msg) {
        console.log("> Recieved request to feed...");
        console.log("> Turning stepper motor");

        port.write('rotate\n', function(err) {
            if (err) {
                return console.log('Error on write: ', err.message);
            }
        });
    });
});

port.on('open', function() {
    console.log("Opened port to board...");
});

port.on('data', function (d) {
    const data = d.toString().trim();

    if(data == "ready-for-commands"){
        console.log("Board is ready for commands...");
    }
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
  process.exit();
})
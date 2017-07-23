var SerialPort = require("serialport");
var config = process.env.NODE_ENV === "dev" ? require("./config") : require("./config.production");

// Open port to board
var port = new SerialPort(config.serialPort, {
  baudRate: 57600,
  parser: SerialPort.parsers.readline('\n')
});

port.on('open', function() {
    log("Opened port to board...");
});


port.on('data', function (d) {
    const data = d.toString().trim();

    if(data == "ready-for-commands"){
        log("Board is ready for commands...");

        // Feeding every second
        log("Feeding every second");
        setInterval(function(){
            port.write('feed\n', function(err) {
                if (err) {
                    return log('Error on write: ', err.message);
                }
            });
        },1000 * 1);
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
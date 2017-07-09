// [ Dependencies ]
var http = require('http').Server();
var io = require('socket.io')(http);

// Config
const config = require("./config.json");
const websocketPort = config.websocketPort;
const apiPort = config.apiPort;

// https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections
let feederClient = null;
io.use(function(socket, next){
  if (socket.handshake.query && socket.handshake.query.key){
    if (socket.handshake.query.key === config.key){
        next();
    }
  }
  next(new Error('Authentication error'));
})
.on('connection', function(socket) {
    console.log("Recieved authenticated connection...");
    feederClient = socket;
});

const express = require('express')
const app = express()

app.get("/fishbot/api", function(req,res){
    res.end("Fishbot API");
});

// Feed fish API route
app.post('/fishbot/api/fish/stomach', function (req, res) {
    if(feederClient === null){
        res.send('failed');
    }else{
        feederClient.emit("feed");
        res.send('success');
    }
})

// Listen for websocket connections
http.listen(websocketPort, function () {
  console.log('listening on port ' + websocketPort);
});

// Listen for api connections
app.listen(apiPort, function () {
  console.log('Example app listening on port ' + apiPort);
})
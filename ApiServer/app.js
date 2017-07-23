// [ Dependencies ]
var moment = require("moment");
var bluebird = require("bluebird");
var redis = require("redis"); // Use reddis to keep track of time
var http = require('http').Server();
var io = require('socket.io')(http);

// Config
const config = process.env.NODE_ENV === "dev" ? require("./config") : require("./config.production");
const websocketPort = config.websocketPort;
const apiPort = config.apiPort;

// Promisfy redis
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
redis = redis.createClient({ password: config.redis.password });

// Get's the lastFed time
let lastFedISO = null;
redis.getAsync('lastFed').then(function(res) {
    // If lastFed time is null, then set it to a dummy date in the past
    if(res === null){
        lastFedISO = "2000-01-01T23:01:00.000Z";
        redis.set("lastFed", lastFedISO);
    }else{
        lastFedISO = res;
    }
});


const utcOffsetOfFish = -240; // This is the UTC offset for my apartment where the fish is
function isFeedable(){
    // Feeding Schedule
    // Must feed once between 7am and 10am
    // Must feed again once between 4pm and 6pm
    // How to see if feedable:
    // Two cases: 
    //  1. current time is within a valid interval 
    //  2. current time is not within a valid interval
    // Algorithim for case 1:
    //  a. Check if last fed time was before start of current interval
    //  b. If this is true, allow users to feed
    // Algorithim for case 2:
    // a. Check if last fed time is before start of last interval
    // b. If true, allow feeds
    // c. If false, don't allow feeds
    let feedable = false;
    const lastFed = moment(lastFedISO);
    const now = moment().utcOffset(utcOffsetOfFish);

    const yestardayIntervalTwoStart = now.clone().startOf("day").subtract(1, "day").add(16, "hours"); // 4 pm yestarday
    const yestardayIntervalTwoEnd = now.clone().startOf("day").subtract(1, "day").add(18, "hours"); // 6 pm yestarday

    const intervalOneStart = now.clone().startOf("day").add(8, "hours"); // 8 am
    const intervalOneEnd = now.clone().startOf("day").add(10, "hours"); // 10 am

    const intervalTwoStart = now.clone().startOf("day").add(16, "hours"); // 4 pm
    const intervalTwoEnd = now.clone().startOf("day").add(18, "hours"); // 6 pm

    const nowIsWithinIntervalOne = now.isBetween(intervalOneStart, intervalOneEnd);
    const nowIsWithinIntervalTwo = now.isBetween(intervalTwoStart, intervalTwoEnd);
    const nowIsWithinInterval = nowIsWithinIntervalOne || nowIsWithinIntervalTwo;

    // Case 1:
    if(nowIsWithinInterval){
        let startOfInterval = null;
        if(nowIsWithinIntervalOne){
            startOfInterval = intervalOneStart;
        }else{
            startOfInterval = intervalTwoStart;
        }

        // Check if last fed is before the start of the current interval
        if(lastFed.isBefore(startOfInterval)){
            feedable = true;
        }
    // Case 2:
    }else{
        let startOfLastInterval = yestardayIntervalTwoStart;
        
        if(now.isAfter(intervalOneStart)){
            startOfLastInterval = intervalOneStart;
        }

        if(now.isAfter(intervalTwoStart)){
            startOfLastInterval = intervalTwoStart;
        }

        // Check if last fed is before the beginning of the last interval
        if(lastFed.isBefore(startOfLastInterval)){
            feedable = true;
        }
    }

    return feedable;
}

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
        if(!isFeedable()){
            return res.send('failed');
        }

        // Update last fed to now. Updates lastFedISO variable and redis
        lastFedISO = moment().toISOString();
        redis.set("lastFed", lastFedISO);

        feederClient.emit("feed");
        res.send('success');
    }
})

// Listen for websocket connections
http.listen(websocketPort, function () {
  console.log('Websocket server listening on port ' + websocketPort);
});

// Listen for api connections
app.listen(apiPort, function () {
  console.log('Rest server listening on port  ' + apiPort);
})
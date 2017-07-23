// [ Dependencies ]
var moment = require("moment");
var bluebird = require("bluebird");
var Redis = require("redis"); // Use reddis to keep track of time
var redis = null; // Actual redis client
var http = require('http').Server();
var io = require('socket.io')(http, { path: '/' });
var Mongo = require("mongodb").MongoClient;
var mongo = null; // Actual mongo client

// Config
const config = process.env.NODE_ENV === "dev" ? require("./config") : require("./config.production");
const websocketPort = config.websocketPort;
const apiPort = config.apiPort;

// Promisfy redis
bluebird.promisifyAll(Redis.RedisClient.prototype);
bluebird.promisifyAll(Redis.Multi.prototype);

// Connect to redis
redis = Redis.createClient({ password: config.redis.password });

// Connect to mongo
Mongo.connect(`mongodb://${config.mongo.user}:${config.mongo.password}@localhost:27017/fishbot`,function(err, db) {
  if(err === null){
    console.log("Connected successfully to mongo db");
    mongo = db;
  }else{
    console.log("Failed to connect to mongo: ", err);
  }
});

// Get's the lastFed time
let lastFedISO = null;
redis.getAsync('lastFed').then(function(res) {
    // If lastFed time is null, then set it to a dummy date in the past
    if(res === null){
        updateLastFed("2000-01-01T23:01:00.000Z");
    }else{
        lastFedISO = res;
    }
});


const utcOffsetOfFish = -240; // This is the UTC offset for my apartment where the fish is
function getFeedableInfo(){
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
    let hungryTime = null;
    const lastFed = moment(lastFedISO);
    const now = moment().utcOffset(utcOffsetOfFish);

    const yestardayIntervalTwoStart = now.clone().startOf("day").subtract(1, "day").add(16, "hours"); // 4 pm yestarday
    const yestardayIntervalTwoEnd = now.clone().startOf("day").subtract(1, "day").add(18, "hours"); // 6 pm yestarday

    const intervalOneStart = now.clone().startOf("day").add(8, "hours"); // 8 am
    const intervalOneEnd = now.clone().startOf("day").add(10, "hours"); // 10 am

    const intervalTwoStart = now.clone().startOf("day").add(16, "hours"); // 4 pm
    const intervalTwoEnd = now.clone().startOf("day").add(18, "hours"); // 6 pm

    const tommorowIntervalTwoStart = now.clone().startOf("day").add(1, "day").add(8, "hours"); // 8 am tommorow
    const tommorowIntervalTwoEnd = now.clone().startOf("day").add(1, "day").add(10, "hours"); // 10 am tommorow

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
        }else{
            if(nowIsWithinIntervalOne){
                hungryTime = intervalTwoStart;
            }else{
                hungryTime = tommorowIntervalTwoStart;
            }
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
        }else{
            hungryTime = tommorowIntervalTwoStart;

            if(now.isBefore(intervalTwoStart)){
                hungryTime = intervalTwoStart;
            }
        
            if(now.isBefore(intervalOneStart)){
                hungryTime = intervalOneStart;
            }
        }
    }

    return {
        feedable,
        hungryTime: hungryTime ? hungryTime.toISOString() : null,
    };
}

// https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections
let feederClient = null;
io.on('connection', function(socket) {
    if (socket.handshake.query && socket.handshake.query.key){
        if (socket.handshake.query.key === config.key){
            console.log("Recieved authenticated connection...");
            feederClient = socket;
        }
    }else{
        const feedableInfo = getFeedableInfo();
        socket.send("updated-last-fed", {
            lastFed: lastFedISO,
            timeSent: moment().toISOString(),
            hungryTime: feedableInfo.hungryTime,
        });
    }
});

const express = require('express')
const app = express()

app.get("/api", function(req,res){
    res.end("Fishbot API");
});

app.get("/api/feeds", function(req, res){ 
    const oneMonthAgo = moment().clone().subtract(1, "month").toISOString();
    mongo.collection("feeds").find({
        time: { $gt: oneMonthAgo }
    },{
        time: 1
    },function(err, cursor){
        if(err){
            return res.end("failed");
        }
        
        // toArary returns a promise that resolves to an array
        cursor.toArray().then((results) => {
            return res.json(results);
        }).catch(() => {
            return res.end("failed");
        })
    });
});

// Feed fish API route
app.post('/api/fish/stomach', function (req, res) {
    if(feederClient === null){
        res.send('failed');
    }else{
        const feedableInfo = getFeedableInfo();

        // Return failed if fish is not feedable (i.e. not hungry)
        if(!feedableInfo.feedable){
            return res.send('failed');
        }

        // Update last fed to now. Updates lastFedISO variable and redis
        const now = moment().toISOString();
        updateLastFed(now);
        feederClient.emit("feed");

        // Create record in mongo
        mongo.collection('feeds').insertOne({
            time: now,
            ip: config.trustProxy ? req.headers['x-forwarded-for'] : req.connection.remoteAddress
        }).then(() => {
            res.send('success');
        }).catch(() => {
            res.send('failed');
        });
    }
});

app.post('/api/admin/last-fed', function(req, res){
    if(req.query.key !== config.key){
        return res.end("failed");
    }

    updateLastFed(req.query.lastFed);
    res.end("success");
});

function updateLastFed(lastFed){
    lastFedISO = lastFed;
    redis.set("lastFed", lastFedISO);

    const feedableInfo = getFeedableInfo();
    io.sockets.send("updated-last-fed", {
        lastFed: lastFedISO,
        timeSent: moment().toISOString(),
        hungryTime: feedableInfo.hungryTime,
    });
}

// Listen for websocket connections
http.listen(websocketPort, function () {
  console.log('Websocket server listening on port ' + websocketPort);
});

// Listen for api connections
app.listen(apiPort, function () {
  console.log('Rest server listening on port  ' + apiPort);
});
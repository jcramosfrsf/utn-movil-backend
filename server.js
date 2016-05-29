var http = require("http");
var url = require("url");
var query = require("./responses");
var notification = require("./notification");
var querystring = require("querystring");
var fs = require("fs");
const PORT = 8888;
var db;

var MongoClient = require("mongodb").MongoClient;
var db = MongoClient.connect("mongodb://127.0.0.1:27017/local", function(err, database) {
    if(err) throw err;
    db = database;
    console.log("Connected to the mongoDB!");
    initServer();
});

function initServer(){
    var server = http.createServer(serveClients);
    server.listen(PORT);
    console.log("Server Started and listening in port="+PORT);
}

function serveClients(request, response){

    var url_parts = url.parse(request.url, true);
    var path =  url_parts.pathname;
    console.log(path);

    switch(path){
        case "/":
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("Working...");
            response.end();
            break;
        case "/post":
            var params = url_parts.query;
            console.log(params.title);
            console.log(params.topic);
            console.log(params.body);
            notification.send("/topics/"+params.topic, params.title, params.body);
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("Notification Sended!");
            response.end();
            break;
        case "/channels":
            query.getChannels(db, response);
            break;
        case "/addChannel":
            request.on('data', (data) => {
            var params = querystring.parse(data.toString());
            var canal = {name: params.name, id: params.id, description: params.description};
            query.addChannel(db,canal,response);
            });
            break;
        case "/addChannel.html":
            fs.readFile(__dirname + path, function(error, data){
            if (error){
               response.writeHead(404);
               response.write("opps this doesn't exist - 404");
               response.end();
            }
            else{
               response.writeHead(200, {"Content-Type": "text/html"});
               response.write(data, "utf8");
               response.end();
            }
            });
            break;
        case "/news":
            query.getNews(db, response);
            break;
        case "/addNew":
            request.on('data', (data) => {
            var params = querystring.parse(data.toString());
            var noticia = {title: params.title, author: params.author, channel: params.channel, body: params.body, pubDate: params.pubDate, eventDate: params.eventDate, image: params.image};
            query.addNew(db,noticia,response);
            });
            break;
        case "/addNew.html":
            fs.readFile(__dirname + path, function(error, data){
              if (error){
                  response.writeHead(404);
                  response.write("opps this doesn't exist - 404");
                  response.end();
              }
              else{
                  response.writeHead(200, {"Content-Type": "text/html"});
                  response.write(data, "utf8");
                  response.end();
              }
            });
            break;
        case "/socket.html":
        /*
        fs.readFile(__dirname + path, function(error, data){
            if (error){
                response.writeHead(404);
                response.write("opps this doesn"t exist - 404");
                response.end();
            }
            else{
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(data, "utf8");
                response.end();
            }
        });*/
        break;
        default:
            response.writeHead(404);
            response.write("opps this doesn't exist - 404");
            response.end();
            break;
    }
}

var PORT = 80;

var express = require("express");
var auth = require('http-auth');
var basic = auth.basic({
	realm: "Admin Area.",
	file: __dirname + "/data/users.htpasswd"
});
var fs = require("fs");
var bodyParser = require('body-parser');
var query = require("./responses");
var notification = require("./notification");
var db;

var MongoClient = require("mongodb").MongoClient;
var db = MongoClient.connect("mongodb://127.0.0.1:27017/local", function(err, database) {
    if(err){
        //throw err;
        console.log("Database connection failed.");
    } else{
        db = database;
        console.log("Connected to Database!");
    }
    initServer();
});

function initServer(){
    var app = express();

    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    }));

    app.post('/addNew', auth.connect(basic), function(req, res){
        //res.send("Hello from admin area - " + req.user + "!");
        var params = req.body;
        var noticia = {title: params.title, contenido: params.contenido};
        console.log(params.title, params.contenido);
        query.addNew(db, noticia, res);
    });

    app.get('/', function(req, res){
        res.send("Working...");
    });

    app.get('/news', function(req, res){
        query.getNews(db, res);
    });

    app.get('/form.html', function(req, res){
        fs.readFile(__dirname + '/form.html', function(error, data){
          if (error){
              res.send("opps this doesn't exist - 404");
          }else{
              res.writeHead(200, {"Content-Type": "text/html"});
              res.write(data, "utf8");
              res.end();
          }
        });
    });

    app.listen(PORT, function () {
        console.log('Server running on port '+PORT);
    });
}

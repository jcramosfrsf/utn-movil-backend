var PORT = 3333;

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
	  var path = __dirname + "/public";

    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
      extended: true
    }));

    app.post('/addNew', auth.connect(basic), function(req, res){
        var params = req.body;
        var noticia = {title: params.titulo, autor: params.autor, canal: params.canal, contenido: params.contenido, imagen: params.imagen};
        console.log(params.titulo, params.autor, params.canal, params.contenido, params.imagen);
        query.addNew(db, noticia, res);
    });

		app.post('/addEvent', auth.connect(basic), function(req, res){
        var params = req.body;
        var evento = {fecha: params.fecha, titulo: params.titulo, lugar: params.lugar};
        console.log(params.fecha, params.titulo, params.lugar);
        query.addEvent(db, evento, res);
    });

		app.post('/login', auth.connect(basic), function(req, res){
				var params = req.body;
        var cred = {usuario: params.inputUser, contraseña: params.inputPassword};
        console.log(cred);
				//si todo OK, devolvemos el form de noticia y evento :)
				res.redirect("http://localhost/noticias.html");
			});

    app.use('/', express.static(path));

    app.get('/news', function(req, res){
        query.getNews(db, res);
    });

    app.listen(PORT, function () {
        console.log('Server running on port '+PORT);
    });
}

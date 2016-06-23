var PORT = 3000;

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
var db = MongoClient.connect("mongodb://root@localhost:27017/local", function(err, database) {
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
		var noticia = {titulo: params.titulo, autor: params.autor, canal: params.canal, contenido: params.contenido, imagen: params.imagen};
		query.addNew(db, noticia, res);
	});

	app.post('/addEvent', auth.connect(basic), function(req, res){
		var params = req.body;
		var evento = {titulo: params.titulo, lugar: params.lugar, canal: params.canal, fecha: params.fecha};
		query.addEvent(db, evento, res);
	});

	app.post('/login', auth.connect(basic), function(req, res){
		var params = req.body;
		var cred = {usuario: params.inputUser, contraseña: params.inputPassword};
		console.log(cred);
		//si todo OK, devolvemos el form de noticia y evento :)
		fs.readFile(path + "/noticias.html", function(err,data){
			if(err){throw err;}
			res.writeHead(200,{
				"Content-Type" : "text/html",
				"Content-length" : data.length
			});
			res.write(data);
			res.end();
		});
	});

	app.get('/getNews', function(req, res){
		query.getNews(db, res);
	});

	app.get('/getChannels', function(req, res){
		query.getChannels(db, res);
	});

	app.get('/getNewsByChannels',function(req,res){
		var params = req.body;
		canales = params.canales;
		query.getNewsByChannels(db, canales, res);
	});

	app.use('/', express.static(path));

	app.listen(PORT, function () {
		console.log('Server running on port '+PORT);
	});
}

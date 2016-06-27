var PORT = 3000;
var EXPIRATION_SECONDS = 60*60*24*10; //Ten Days

var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var query = require("./responses");
var notification = require("./notification");
var secret = require("./secret");
var db;

var MongoClient = require("mongodb").MongoClient;
var db = MongoClient.connect("mongodb://nodejs:password@localhost:27017/app?authSource=admin", function(err, database) {
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
	app.use(cookieParser());

	//Protected Routes
	app.use('/addNew', verifyToken);
	app.use('/addEvent', verifyToken);
	app.use('/noticias.html', verifyToken);
	app.use('/eventos.html', verifyToken);

	app.post('/authenticate', function(req, res) {
		var user = req.body.inputUser;
		var pass = req.body.inputPassword;
		db.authenticate(user, pass, function(err, dbres){
			if(err){
				res.status(401).send('Wrong user or password');
				return;
			}
			var profile = {
				user: user,
				pass: pass
			};
			var token = jwt.sign(profile, secret.API_KEY, { expiresIn : EXPIRATION_SECONDS });
			res.cookie('token', token, { maxAge: EXPIRATION_SECONDS, httpOnly: true });
			res.status(200).redirect('/noticias.html');
		})

	});

	app.post('/addNew', function(req, res){
		var params = req.body;
		var noticia = {titulo: params.titulo, autor: params.autor, canal: params.canal, cuerpo: params.cuerpo, imagen: params.imagen};
		query.addNew(db, noticia, res);
	});

	app.post('/addEvent', function(req, res){
		var params = req.body;
		var evento = {titulo: params.titulo, lugar: params.lugar, canal: params.canal, fecha: params.fecha};
		query.addEvent(db, evento, res);
	});

	app.get('/', function(req, res){
		res.redirect('login.html');
	});

	app.get('/logout',function(req,res){
		res.clearCookie("token");
		res.redirect('login.html');
	});

	app.get('/getNews', function(req, res){
		var offset;
		if(req.query != null && req.query.offset != null){
			offset = parseInt(req.query.offset);
		}else{
			offset = 0;
		}
		query.getNews(db, offset, res);
	});

	app.get('/getChannels', function(req, res){
		query.getChannels(db, res);
	});

	app.post('/getNewsByChannels',function(req,res){
		var params = req.body;
		var offset;
		if(req.query != null && req.query.offset != null){
			offset = parseInt(req.query.offset);
		}else{
			offset = 0;
		}
		query.getNewsByChannels(db, params.canales, offset, res);
	});

	app.get('/getEvents', function(req, res){
		var params = req.body;
		var mes;
		var año;
		if(req.query != null && req.query.año != null){
			año = parseInt(req.query.año)
		}
		else{
			año = 0;
		}
		if(req.query != null && req.query.mes != null){
			mes = parseInt(req.query.mes);
		}
		else{
			mes = 0;
		}
		query.getEvents(db, params.canales, año, mes, res);
	});

	app.get('/queryPrueba',function(req,res){
		var canales = null;
		query.getNewsByChannels(db, canales, res);
	});

	app.use('/', express.static(path));

	app.listen(PORT, function () {
		console.log('Server running on port '+PORT);
	});
}

function verifyToken(req, res, next){
	var token = req.cookies.token;
	if(token){
		var decode = jwt.verify(token, secret.API_KEY);
		db.authenticate(decode.user, decode.pass, function(err, dbres){
			if(err){
				res.status(401).send('Token expired or invalid permissions.');
				return;
			}
			next();
		});
	}else{
		res.status(401).redirect('/login');
	}
}

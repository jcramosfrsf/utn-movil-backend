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
var db = MongoClient.connect("mongodb://nodejs:password@localhost:27017/app?authSource=admin", function(err, database){
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

	app.post('/authenticate', function(req, res){
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

	app.use('/', express.static(path));

	app.get('/', function(req, res){
		res.redirect('login.html');
	});

	app.get('/logout',function(req, res){
		res.clearCookie("token");
		res.redirect('login.html');
	});

	app.post('/addNew', function(req, res){
		query.addNew(db, req, res);
	});

	app.post('/addEvent', function(req, res){
		query.addEvent(db, req, res);
	});

	app.get('/getNews', function(req, res){
		query.getNews(db, req, res);
	});

	app.get('/getChannels', function(req, res){
		query.getChannels(db, res);
	});

	app.post('/getEvents', function(req, res){
		query.getEvents(db, req, res);
	});

	app.get('/queryPrueba',function(req, res){
		//query.getEvents(db, null, 1999, 1, res);
		query.queryPrueba();
	});

	app.listen(PORT, function(){
		console.log('Server running on port '+ PORT);
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

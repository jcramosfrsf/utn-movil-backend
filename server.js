var HTTP_PORT = 3000;
var HTTPS_PORT = 443;
var EXPIRATION_SECONDS = 1000*60*60*24*10; //Ten Days

var http = require("http");
var https = require("https");
var fs = require("fs");
var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var query = require("./responses");
var notification = require("./notification");
var secret = require("./secret");
var privateKey  = fs.readFileSync('ssl/key.pem', 'utf8');
var certificate = fs.readFileSync('ssl/cert.pem', 'utf8');
var db;

var MongoClient = require("mongodb").MongoClient;
var dbConnection = MongoClient.connect("mongodb://nodejs:password@localhost:27017/app?authSource=admin", function(err, database){
	if(err){
		console.log("Database connection failed.");
	} else{
		db = database;
		console.log("Connected to Database!");
		initAppServer();
		initWebServer();
	}
});

function initAppServer(){
	var app = express();

	app.use(bodyParser.json()); // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
		extended: true
	}));

	app.get('/getChannels', function(req, res){
		query.getChannels(db, res);
	});

	app.post('/getNews', function(req, res){
		query.getNews(db, req, res);
	});

	app.post('/getEvents', function(req, res){
		query.getEvents(db, req, res);
	});

	var httpServer = http.createServer(app);

	httpServer.listen(HTTP_PORT, function(){
		console.log('HTTP App Server running on port '+ HTTP_PORT);
	});
}

function initWebServer(){
	var credentials = {key: privateKey, cert: certificate};
	var web = express();
	var path = __dirname + "/public";

	web.use(bodyParser.json());
	web.use(bodyParser.urlencoded({
		extended: true
	}));
	web.use(cookieParser());

	//Force HTTPS
	web.use(function(req, res, next) {
	  if(!req.secure) {
	    return res.redirect(['https://', req.get('Host'), req.url].join(''));
	  }
	  next();
	});

	//Protected Routes
	web.use('/addNew', verifyToken);
	web.use('/addEvent', verifyToken);
	web.use('/noticias.html', verifyToken);
	web.use('/eventos.html', verifyToken);

	web.post('/authenticate', function(req, res){
		var user = req.body.inputUser;
		var pass = req.body.inputPassword;
		db.authenticate(user, pass, function(err, dbres){
			if(err){
				res.status(401).send('Wrong user or password');
				return;
			}
			var payload = {
				sub: user,
				permissions: true
			};
			var token = jwt.sign(payload, secret.API_KEY, { expiresIn : EXPIRATION_SECONDS });
			res.cookie('token', token, { maxAge: EXPIRATION_SECONDS, httpOnly: true });
			res.status(200).redirect('/noticias.html');
		})
	});

	web.use('/', express.static(path));

	web.get('/', function(req, res){
		res.redirect('login.html');
	});

	web.get('/logout',function(req, res){
		res.clearCookie("token");
		res.redirect('login.html');
	});

	web.post('/addNew', function(req, res){
		query.addNew(db, req, res);
	});

	web.post('/addEvent', function(req, res){
		query.addEvent(db, req, res);
	});

	web.get('/getChannels', function(req, res){
		query.getChannels(db, res);
	});

	var httpsServer = https.createServer(credentials, web);

	httpsServer.listen(HTTPS_PORT, function(){
		console.log('HTTPS Web Server running on port '+ HTTPS_PORT);
	});
}

function verifyToken(req, res, next){
	var token = req.cookies.token;
	if(token){
		jwt.verify(token, secret.API_KEY, function(err, decoded) {
			if(!err && decoded){
				next();
			}
		});
	}else{
		res.status(401).redirect('/login.html');
	}
}

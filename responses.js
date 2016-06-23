var assert = require("assert");
require("date-utils");

module.exports.getNews = function(db, response){
  var result = [];
  var cursor = db.collection("noticias").find().limit(10);
  response.writeHead(200, {"Content-Type": "application/json"});
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      result.push(doc);
    } else {
      var string = JSON.stringify(result);
      response.write(string);
      response.end();
    }
  });
}

module.exports.getNewsByChannels = function(db, canales, response){
  var result = [];
  var cursor = db.collection("noticias").find( { canal: { $in: canales } } ).sortBy("fecha");
  response.writeHead(200, {"Content-Type": "application/json"});
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      result.push(doc);
    } else {
      var string = JSON.stringify(result);
      response.write(string);
      response.end();
    }
  });
}

module.exports.getChannels = function(db, response){
  var result = [];
  var cursor = db.collection("canales").find();
  response.writeHead(200, {"Content-Type": "application/json"});
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      result.push(doc);
    } else {
      var string = JSON.stringify(result);
      response.write(string);
      response.end();
    }
  });
}

module.exports.addNew = function(db, noticia,response){
  db.collection("news").insertOne( {
    "titulo": noticia.titulo,
    "autor": noticia.autor,
    "canal": noticia.canal,
    "contenido": noticia.contenido,
    "imagen": noticia.imagen,
    "fecha": Date().toString()
  }, function(err, result) {
    assert.equal(err, null);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Noticia Insertada!");
    response.end();
    //TODO: Migrar a FireBase
    //notification.send("/topics/"+params.topic, params.title, params.body);
  });
}

module.exports.addEvent = function(db, evento,response){
  db.collection("events").insertOne( {
    "fecha": evento.fecha,
    "titulo": evento.titulo,
    "lugar": evento.lugar
  }, function(err, result) {
    assert.equal(err, null);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Evento Insertado!");
    response.end();
  });
}

module.exports.addChannel = function(db, canal,response){
  db.collection("channels").insertOne( {
    "id": canal.id,
    "name": canal.name,
    "description": canal.description
  }, function(err, result) {
    assert.equal(err, null);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Canal Insertado!");
    response.end();
  });
}

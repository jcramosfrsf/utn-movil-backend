var assert = require("assert");
require("date-utils");

module.exports.getNews = function(db, offset, response){
  var result = [];
  var cursor = db.collection("noticias").find().skip(offset).limit(10);
  response.status(200);
  response.set({"content-type": "application/json; charset=utf-8"});
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

module.exports.getNewsByChannels = function(db, canales, offset, response){
  var result = [];
  var cursor = db.collection("noticias").find( { canal: { $in: canales } } ).skip(offset).limit(10);
  response.status(200);
  response.set({"content-type": "application/json; charset=utf-8"});
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
  response.status(200);
  response.set({"content-type": "application/json; charset=utf-8"});
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

module.exports.getEvents = function(db, canales, año, mes, response){
  var result = [];
  mes = mes -1;// la notacion de Date requiere que el mes vaya de 0 a 11, entocnes restamos uno.
  var fechaInf = new Date(año, mes);
  var fechaSup;
  if(mes == 11){
    fechaSup = new Date(año + 1, 0);
  }
  else{
    fechaSup = new Date(año, mes + 1);
  }
  var cursor = db.collection("eventos").find({"$and" :  [{"canal": { "$in": canales }}, {"fecha" : {"$gte" : fechaInf}}, {"fecha" : {"$lt" : fechaSup}}]});
  response.status(200);
  response.set({"content-type": "application/json; charset=utf-8"});
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
  db.collection("noticias").insertOne( {
    "titulo": noticia.titulo,
    "autor": noticia.autor,
    "canal": noticia.canal,
    "cuerpo": noticia.cuerpo,
    "imagen": noticia.imagen,
    "fecha": Date().toString()
  }, function(err, result) {
    assert.equal(err, null);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Noticia Insertada!");
    response.end();
    notification.send(noticia.canal, params.titulo, params.cuerpo);
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
    "name": canal.nombre,
    "description": canal.description
  }, function(err, result) {
    assert.equal(err, null);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Canal Insertado!");
    response.end();
  });
}

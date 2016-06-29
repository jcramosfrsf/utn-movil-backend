var assert = require("assert");
var notification = require("./notification");
require("date-utils");

module.exports.getNews = function(db, request, response){
  var parametros;
  var success;
  validarParamtrosGetNews(request, success, parametros);
  if(success){
    var result = [];
    var cursor = db.collection("noticias").find( { canal: { $in: parametros.canales } } ).skip(parametros.offset).limit(10);
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        result.push(doc);
      } else {
        response.status(200).json(result);
      }
    });
  }
  else{
    response.send("No se pudieron obtener las Noticias, parámetros incompletos.");
  }
}

module.exports.getChannels = function(db, response){
  var result = [];
  var cursor = db.collection("canales").find();
  cursor.each(function(err, doc) {
    assert.equal(err, null);
    if (doc != null) {
      result.push(doc);
    } else {
      response.status(200).json(result);
    }
  });
}

module.exports.getEvents = function(db, request, response){
  var parametros;
  var success;
  validarParametrosGetEvents(request, success, parametros);
  if(success){
    var cursor = db.collection("eventos").find({"$and" :  [{"canal": { "$in": parametros.canales }}, {"fecha" : {"$gte" : parametros.dateMin}}, {"fecha" : {"$lt" : parametros.dateMax}}]});
    cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        result.push(doc);
      }else{
        response.status(200).json(result);
      }
    });
  }
  else{
    response.send("No se pudieron obtener los Eventos, parámetros incompletos.");
  }
}

module.exports.addNew = function(db, request, response){
  var noticia;
  var success;
  validarNoticia(request, success, noticia);
  if(success){
    db.collection("noticias").insertOne(noticia, function(err, result) {
      assert.equal(err, null);
      response.send("Noticia Insertada!");
      notification.send(noticia.canal, noticia.titulo, noticia.cuerpo);
    });
  }
  else{
    response.send("No se pudo insertar la Noticia, parámetros incompletos.");
  }
}

module.exports.addEvent = function(db, request, response){
  var evento;
  var success;
  validarEvento(request, success, evento);
  if(success){
    db.collection("eventos").insertOne(evento, function(err, result) {
      assert.equal(err, null);
      response.send("Evento Insertado!");
    });
  }
  else{
    response.send("No se pudo insertar el Evento, parámetros incompletos.");
  }
}

module.exports.addChannel = function(db, request, response){
  var canal;
  var success;
  validarCanal(request, success, canal);
  if(success){
    db.collection("canales").insertOne(canal, function(err, result) {
      assert.equal(err, null);
      response.send("Canal Insertado!");
    });
  }
  else{
    response.send("No se pudo insertar el Canal, parámetros incompletos.");
  }
}

function validarNoticia(request, success, noticia){
  if(request.body != null){
    var params = request.body;
    if(params.titulo != null && params.autor != null && params.canal != null && params.cuerpo != null){
      noticia = {titulo: params.titulo, autor: params.autor, canal: params.canal, cuerpo: params.cuerpo, fecha: "fecha": Date().toString() };
      success = true;
    }
    else{
      success = false;
    }
  }
  else{
    success = false;
  }
}

function validarEvento(request, success, evento){
  if(request.body != null){
    var params = request.body;
    if(params.titulo != null && params.lugar != null && params.fecha != null){
      evento = {titulo: params.titulo, lugar: params.lugar, fecha: params.fecha };
      success = true;
    }
    else{
      success = false;
    }
  }
  else{
    success = false;
  }
}

function validarCanal(request, success, canal){
  if(request.body != null){
    var params = request.body;
    if(params.id != null && params.nombre != null && params.descripcion != null){
      canal = {titulo: params.id, lugar: params.nombre, fecha: params.descripcion };
      success = true;
    }
    else{
      success = false;
    }
  }
  else{
    success = false;
  }
}

function validarParametrosGetEvents(request, success, parametros){
  if(request.body != null && request.query != null){
    var params = request.body;
    var query = request.query;
    if(params.canales != null && query.year != null && query.month != null){
      var year = parseInt(query.year);
      var month = parseInt(query.month);
      var result = [];
      month = month -1;// la notacion de Date requiere que el mes vaya de 0 a 11, entocnes restamos uno.
      var dateMin = new Date(year, month);
      var dateMax;
      if(mes == 11){
        dateMax = new Date(year + 1, 0);
      }
      else{
        dateMax = new Date(year, month + 1);
      }
      parametros = {canales: params.canales, dateMin: dateMin, dateMax: dateMax};
      success = true;
    }
    else{
      success = false;
    }
  }
  else{
    success = false;
  }
}

function validarParamtrosGetNews(request, success, parametros){
  if(request.body != null){
    var params = request.body;
    if(params.canales != null){
      var offset;
      if(request.query != null && request.query.offset != null){
        offset = parseInt(request.query.offset);
      }else{
        offset = 0;
      }
      parametros = {canales: params.canales, offset: offset};
      success = true;
    }
    else{
      success = false;
    }
  }
  else{
    success = false;
  }
}

var assert = require("assert");
var notification = require("./notification");
require("date-utils");

module.exports.getNews = function(db, request, response){
  if(request.body != null){
    var params = request.body;
    if(params.canales != null){
      var offset;
      if(request.query != null && request.query.offset != null){
        offset = parseInt(request.query.offset);
      }else{
        offset = 0;
      }
      var result = [];
      var cursor = db.collection("noticias").find( { canal: { $in: params.canales } } ).skip(offset).limit(10);
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
      var cursor = db.collection("eventos").find({"$and" :  [{"canal": { "$in": params.canales }}, {"fecha" : {"$gte" : dateMin}}, {"fecha" : {"$lt" : dateMax}}]});
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
      response.send("No se pudieron obtener los Eventos, parámetros incompletos.");
    }
  }
  else{
    response.send("No se pudieron obtener los Eventos, parámetros incompletos.");
  }
}

module.exports.addNew = function(db, request, response){
  if(request.body != null){
    var params = request.body;
    if(params.titulo != null && params.autor != null && params.canal != null && params.cuerpo != null){
      db.collection("noticias").insertOne( {
        "titulo": params.titulo,
        "autor": params.autor,
        "canal": params.canal,
        "cuerpo": params.cuerpo,
        "imagen": params.imagen,
        "fecha": Date().toString()
      }, function(err, result) {
        assert.equal(err, null);
        response.send("Noticia Insertada!");
        notification.send(params.canal, params.titulo, params.cuerpo);
      });
    }
    else{
      response.send("No se pudo insertar la Noticia, parámetros incompletos.");
    }
  }
  else{
    response.send("No se pudo insertar la Noticia, parámetros incompletos.");
  }
}

module.exports.addEvent = function(db, request, response){
  if(request.body != null){
    var params = request.body;
    if(params.fecha != null && params.titulo != null && params.lugar != null){
      db.collection("events").insertOne( {
        "fecha": params.fecha,
        "titulo": params.titulo,
        "lugar": params.lugar
      }, function(err, result) {
        assert.equal(err, null);
        response.send("Evento Insertado!");
      });
    }
    else{
      response.send("No se pudo insertar el Evento, parámetros incompletos.");
    }
  }
  else{
    response.send("No se pudo insertar el Evento, parámetros incompletos.");
  }
}

module.exports.addChannel = function(db, request, response){
  if(request.body != null){
    var params = request.body;
    if(params.id != null && params.nombre != null && params.descripcion){
      db.collection("channels").insertOne( {
        "id": params.id,
        "nombre": params.nombre,
        "descripcion": params.descripcion
      }, function(err, result) {
        assert.equal(err, null);
        response.send("Canal Insertado!");
      });
    }
    else{
      response.send("No se pudo insertar el Canal, parámetros incompletos.");
    }
  }
  else{
    response.send("No se pudo insertar el Canal, parámetros incompletos.");
  }
}

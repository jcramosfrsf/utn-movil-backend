var assert = require("assert");
var notification = require("./notification");
require("date-utils");

module.exports.getNews = function(db, request, response){
    if(request.body != null){
        var params = request.body;
        var channels = params.channels;
        //channels = ["institucional", "sistemas", "be"]; //Canales Hardcodeados para el GET.
        var offset = 0;
        if(request.query != null && request.query.offset != null){
            offset = request.query.offset;
        }
        if(canales != null){
            var result = [];
            var cursor = db.collection("noticias").find( { canal: { $in: channels } } ).skip(offset).limit(10);
                cursor.each(function(err, doc) {
                assert.equal(err, null);
                if (doc != null) {
                    result.push(doc);
                } else {
                    response.status(200).send(result);
                }
            });
        }
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
    var result = [];
    if(request.body != null){
        var params = request.body;
        var channels = params.channels;
        var month = request.query.month;
        var year = request.query.year;
        //channels = ["institucional", "sistemas", "be"]; //Canales Hardcodeados para el GET.
        if(canales != null && month != null && year != null){
            var start = new Date(year, month);
            month++;
            var end = new Date(year, month);
            var cursor = db.collection("eventos").find({"$and" :  [{"canal": { "$in": canales }}, {"fecha" : {"$gte" : start, "$lt" : end}}]});
            cursor.each(function(err, doc) {
                assert.equal(err, null);
                if (doc != null) {
                    result.push(doc);
                }else{
                    response.status(200).json(result);
                }
            });
        }
    }
}

module.exports.addNew = function(db, request, response){
    if(request.body != null){
        var params = request.body;
        if(params.titulo != null && params.canal != null && params.cuerpo != null){
            db.collection("canales").findOne({ _id: params.canal }, function(err, canal){
                if(err == null && canal != null){
                    currentDate = new Date();
                    noticia = {titulo: params.titulo, autor: canal.nombre, canal: params.canal, cuerpo: params.cuerpo, imagen: params.url, fecha: currentDate };
                    db.collection("noticias").insertOne(noticia, function(err, result) {
                        assert.equal(err, null);
                        if(err == null){
                            response.send("Noticia Insertada!");
                            notification.send(noticia.canal, noticia.titulo, noticia.cuerpo);
                        }else{
                            console.log(err);
                        }
                    });
                }
            });
        }
    }
}

module.exports.addEvent = function(db, request, response){
    if(request.body != null){
        var params = request.body;
        if(params.titulo != null && params.lugar != null && params.canal != null && params.fecha != null){
            var date = new Date(params.fecha);
            var evento = {titulo: params.titulo, lugar: params.lugar, canal: params.canal, fecha: date };
            db.collection("eventos").insertOne(evento, function(err, result) {
                assert.equal(err, null);
                if(err == null){
                    response.send("Evento Insertado!");
                    notification.send(evento.canal, evento.titulo, evento.lugar);
                }else{
                    console.log(err);
                }
            });
        }
    }
}

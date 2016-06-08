var assert = require("assert");

module.exports.getNews = function(db, response){
    var result = [];
    var cursor = db.collection("news").find().limit(10);
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
    var cursor = db.collection("channels").find();
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
        "title": noticia.title,
        "author": noticia.author,
        "channel": noticia.channel,
        "body": noticia.body,
        "pubDate": noticia.pubDate,
        "eventDate": noticia.eventDate,
        "image": noticia.image
    }, function(err, result) {
        assert.equal(err, null);
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("Noticia Insertada!");
        response.end();
        //TODO: Migrar a FireBase
        //notification.send("/topics/"+params.topic, params.title, params.body);
    });
}

module.exports.addChannel = function(db, canal,response){
    db.collection("channels").insertOne( {
        "name": canal.name,
        "id": canal.id,
        "description": canal.description
    }, function(err, result) {
        assert.equal(err, null);
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("Canal Insertado!");
        response.end();
    });
}

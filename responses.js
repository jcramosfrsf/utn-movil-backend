var assert = require("assert");

module.exports.getNews = function(db, response){
    var cursor = db.collection("noticias").find().limit(10);
    response.writeHead(200, {"Content-Type": "application/json"});
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            var string = JSON.stringify(doc);
            response.write(string);
        } else {
            response.end();
        }
    });
}

module.exports.addNew = function(db, noticia,response){
     db.collection('noticias').insertOne( {
       "title": noticia.title,
       "contenido": noticia.contenido
     }, function(err, result) {
      assert.equal(err, null);
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write("Noticia Insertada!");
      response.end();
    });
}

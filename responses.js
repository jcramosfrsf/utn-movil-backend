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

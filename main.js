var MongoClient = require('mongodb').MongoClient;
var myCollection;

var db = MongoClient.connect('mongodb://127.0.0.1:27017/local', function(err, db) {
    if(err)
        throw err;

    console.log("connected to the mongoDB !");
    myCollection = db.collection('Users');

  	myCollection.insert({name: "Tomas"},{name: "Tomas", description: "Administrador"}, function(err, result) {
      if(err)
          throw err;

      console.log("entry saved");
  	});
});

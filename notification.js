var FCM = require("fcm-node");
var secret = require("./secret");
var maxChars = 140;

module.exports.send = function(topic, title, body, response){
    var fcm = new FCM(secret.API_KEY);

    var bodyString = params.body;
    if(bodyString.length > maxChars){
        bodyString = bodyString.substr(0, maxChars)+"...";
    }

    var message = {
        to: "/topics/"+topic,
        notification: {
            title: title,
            body: bodyString,
            icon: 'ic_stat_utn'
        }
    };

    fcm.send(message, function (err, response) {
        if(err) console.error(err);
        else 	console.log(response);
    });
}

var FCM = require("fcm-node");
var secret = require("./secret");

module.exports.send = function(tag, topic, title, body, response){
    var fcm = new FCM(secret.API_KEY);

    var message = {
        to: "/topics/"+topic,
        priority: "high",
        notification: {
            title: title,
            body: body,
            icon: 'ic_stat_utn',
            tag: tag
        }
    };

    fcm.send(message, function (err, response) {
        if(err) console.error(err);
        else 	console.log(response);
    });
}

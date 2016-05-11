var gcm = require("node-gcm");
var secret = require("./secret");

module.exports.send = function(topic, title, body, response){
    var sender = gcm.Sender(secret.API_KEY);
    var message = gcm.Message();
    message.addNotification({
      title: title,
      icon: 'ic_launcher',
      body: body
    });
    sender.sendNoRetry(message, { topic: topic }, function (err, response) {
        if(err) console.error(err);
        else 	console.log(response);
    });
}

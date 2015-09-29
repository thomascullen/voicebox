// USES THE AMAZING DUCKDUCKGO API(https://duckduckgo.com/api)
voiceBox.addResponder(/(Find information about |Tell me about |What is\s?[an]*\s(?!the)|What are )([^\d]+)/i, function(){
  var query = RegExp.$2
  voiceBox.request('http://api.duckduckgo.com/?q=Where+is+'+query+'&format=json&pretty=1', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      if ( body.Abstract ){
        voiceBox.respond(body.Abstract);
      }else{
        voiceBox.respond("I'm sorry I couldn't find any information about "+query)
      }
    }
  })
})

voiceBox.addResponder(/What's the weather like in (.*)/i, function(){
  voiceBox.request('http://api.openweathermap.org/data/2.5/weather?q='+RegExp.$1, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      voiceBox.respond(JSON.parse(body).weather[0].description)
    }
  })
})

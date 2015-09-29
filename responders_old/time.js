voiceBox.addResponder(/time is it/i, function(){
  var time = new Date();
  voiceBox.respond("It's "+time.getMinutes()+" minutes past "+(time.getHours() % 12))
})

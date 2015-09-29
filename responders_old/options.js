voiceBox.addResponder(/Give me options/i, function(){

  voiceBox.addChoice(/one|1/i, function(){
    voiceBox.respond('You selected option one')
  })

  voiceBox.addChoice(/two|2/i, function(){
    voiceBox.respond('You selected option two')
  })

  voiceBox.choice('Do you want option one or option two?')
})

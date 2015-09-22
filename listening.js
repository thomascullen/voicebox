var ipc = require('ipc');

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
// setting interimResults to true will give results even if they are not final
recognition.interimResults = true;

var timer
var timerDuration = 1500
var waitingForResponse = false

recognition.onresult = function(event) {
  var interim_transcript = '';
  var currentResult = event.results[event.resultIndex][0].transcript

  // if they said cancel
  if ( /cancel/i.test(currentResult) ){
    recognition.stop()
    ipc.send('cancel')
  }

  for (var i = event.resultIndex; i < event.results.length; ++i) {
    interim_transcript += event.results[i][0].transcript;
  }

  document.getElementById('input').innerHTML = interim_transcript

  clearTimeout(timer)
  timer = setTimeout(function(){
    if ( waitingForResponse == false ){
      waitingForResponse = true
      recognition.stop()
      document.getElementById('voicebox').classList.add('dismiss')
      setTimeout(function(){
        ipc.send('speechInput', interim_transcript);
      }, 500)
    }
  }, timerDuration)
}

recognition.start()

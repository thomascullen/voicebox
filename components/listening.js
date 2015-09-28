'use babel';

// components/listening.js
// this component is rendered while listening for input from the user.

import ipc from 'ipc';
import React from 'react';

class Listening extends React.Component {

  // set the initial state
  constructor(props) {
    super(props);
    this.state = { input: '', class: '' }
  }

  // when the component has mounted then register the listeners
  componentDidMount(){
    var self = this

    // speech recognition object
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // timer stuff
    // because the speech recognition API takes so long to get a final result
    // we use a timer hack to get a faster response.
    // When we receive input we set a the timer var to a timeout function to
    // repspond in 1 second. However every time we recieve input we clear the
    // timeout and reset it. This means once the user has stopped talking we
    // will respond in 1 second.
    var timer
    var timerDuration = 1000
    var waitingForResponse = false

    // on result listener for recognition object
    recognition.onresult = function(event) {
      // transcript is used to store the input as the user is speaking
      var transcript = '';
      // current result is the transcript of the current result the
      // speech API returned
      var currentResult = event.results[event.resultIndex][0].transcript

      // cancel keyword
      if ( /cancel/i.test(currentResult) ){
        recognition.stop()
        ipc.send('cancel')
      }

      // iterate through the results and build the input string
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }

      // set the input state to the transcript
      self.setState({ input: transcript })

      // clear the timer function
      clearTimeout(timer)
      // and reset it...
      timer = setTimeout(function(){
        if ( waitingForResponse == false ){
          waitingForResponse = true
          recognition.stop()
          self.setState({class: 'dismiss'})

          setTimeout(function(){
            // send the input
            ipc.send('speechInput', self.state.input);
          }, 500)
        }
      }, timerDuration)
    }

    recognition.start();
  }

  render() {
    var tooltip
    if ( this.state.input.length == 0){
      tooltip = <i>What can I do for you?</i>
    }

    return (
      <div className={'voicebox '+this.state.class}>
        <div id='input'>
          {this.state.input}
          {tooltip}
        </div>

        <div className='soundwaves'>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }
}

React.render(<Listening />, document.body);

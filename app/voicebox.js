var ipc = require('ipc');
var say = require('./say.js');
var Configstore = require('configstore');
var spawn = require('child_process').spawn;
var BrowserWindow = require('browser-window');
var VoiceBoxResponder = require('./voicebox_responder');

function VoiceBox(){
  var self = this
  // this.choices is used to store choices when giving a user a choice between
  // options.
  this.choices = []
  // All of the defined responses inside the responses directory are stored into
  // this array
  this.responders = []
  // this.listening is set to true when voice recognition is active
  this.listening = false
  // this.window refrences the voice recognition window when it is active
  this.window = undefined
  // Used to store the last response
  this.last_response = ''
  // waiting_for_response is set to true when waiting for a user to choose an option
  this.waiting_for_response = false;
  // this.request is used to make API requests
  this.request = require('request');
  // this.db is used to store information. e.g the users name
  this.db = new Configstore('voicebox');

  // this.listen actives the voice recognition window
  // the voice recognition code can be found in listening.js
  this.listen = function(){
    say.stop()

    self.listening = true
    self.window = new BrowserWindow({
      frame: false,
      resizable: false,
      transparent: true,
      width: 330,
      height: 400,
      'always-on-top': true
    });

    self.window.loadUrl('file://' + __dirname + '/../views/listening.html');
  }

  // sets listening to false and closes the voice recognition window
  this.stopListening = function(){
    self.listening = false
    self.window.close()
  }

  // this.addResponder is used to add a new responder to the responders array
  this.addResponder = function(regex, response){
    this.responders.push(new VoiceBoxResponder(regex, response))
  }

  // this.addChose is used to add a new choice ( responder ) to the choices array
  this.addChoice = function(regex, response){
    this.choices.push(new VoiceBoxResponder(regex, response))
  }

  // this.repond respondes with a given message
  this.respond = function(message, callback){
    self.last_response = message
    say.speak(null,  message, callback);
  }

  // this.choice responds with a given message and listens for a repsonse
  this.choice = function(message){
    self.waiting_for_response = true
    self.respond(message, function(){
      self.listen()
    })
  }

  // the speechInput event is called when the voice recognition has finished
  ipc.on('speechInput', function(event, input){
    console.log(input);
    // stop listening
    self.stopListening()
    var response

    // if waiting for a response
    if ( self.waiting_for_response ){

      // iterate through the given choices
      Array.prototype.forEach.call(self.choices, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });

      // if they chose an invalid choice then ask again
      if ( response == undefined ){
        self.choice(self.last_response)
        return
      }else{
        // otherwise reset the choices array and set waiting for response to false
        self.choices = []
        self.waiting_for_response = false
      }

    }else{
      // iterate through the posible responses
      Array.prototype.forEach.call(self.responders, function(responder, i){
        if ( responder.regex.test(input) ){
          response = responder
        }
      });
    }

    // if a responder was found then call its response function
    if ( response != undefined ){
      response.response()
    }
  })

  ipc.on('cancel', function(event){
    self.stopListening()
  })
}

module.exports = new VoiceBox()

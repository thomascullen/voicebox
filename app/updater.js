var request = require('request');

function Updater(){
  var self = this

  // check github for a new release
  this.checkForUpdate = function(app){
    // this reaches the github api limit pretty quickly...
    
    // var options = {
    //   url: 'https://api.github.com/repos/thomascullen/voicebox/releases/latest',
    //   headers: { 'User-Agent': 'thomascullen' }
    // }
    //
    // request(options, function (error, response, body) {
    //   var latest_version = JSON.parse(body).tag_name;
    //   if ( app.getVersion() !== latest_version ){
    //     self.update()
    //   }
    // });
  }

  // update the app
  // It would be cool to do this automatically down the line using the choices API
  // e.g
  // 'A new release of voicebox is now available, would you like to update to the latest version?'
  this.update = function(){
    voiceBox.respond('A new release of VoiceBox is now available. Please visit the voicebox git hub page to get the latest version')
  }
}

module.exports = new Updater()

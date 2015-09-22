var ipc = require('ipc');
var Configstore = require('configstore');
var BrowserWindow = require('browser-window');

function Settings(){
  var self = this;
  this.config = new Configstore('voicebox_config');
  this.window = undefined

  this.open = function(){
    self.window = new BrowserWindow({
      width: 400,
      height: 250,
      resizable: false,
      'title-bar-style': 'hidden'
    });

    self.window.loadUrl('file://' + __dirname + '/../views/settings.html');
  }

  // save_setting event can be called to save a setting key and value
  ipc.on('save_setting', function(event, key, value){
    self.config.set(key, value);
  })

  ipc.on('get_config', function(event){
    event.sender.send('voicebox_config', self.config.all);
  })
}

module.exports = new Settings()

var ipc = require('ipc');
var path = require('path');
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

  this.iconPath = function(){
    if ( self.config.get('dark_menu_tray_icon') == true ){
      return path.join(__dirname, '../assets/tray_white.png')
    }else{
      return path.join(__dirname, '../assets/tray.png')
    }
  }

  ipc.on('update_tray_icon', function(event){
    trayIcon.setImage(self.iconPath())
  })
}

module.exports = new Settings()

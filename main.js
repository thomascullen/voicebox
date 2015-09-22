var app = require('app');  // Module to control application life.
var Menu = require('menu');
var Tray = require('tray');
var path = require('path');
var globalShortcut = require('global-shortcut');
var os = require('os');

voiceBox = require('./voicebox');

// require all files in the /responses directory
var responsesPath = require("path").join(__dirname, "responders");
require("fs").readdirSync(responsesPath).forEach(function(file) {
  require("./responders/" + file);
});

// Hide the dock icon
if(os.platform() === 'darwin')
  app.dock.hide();

// setting some chromium flags to enable window transparency on linux
if(os.platform() === 'linux'){
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
}

var trayIcon = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Tray icon
  trayIcon = new Tray(path.join(__dirname, 'assets/tray.png'));
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: function(){
        app.quit()
      }
    }
  ]);
  trayIcon.setContextMenu(contextMenu);

  // Register the shortcut
  globalShortcut.register('alt+s', function() {
    if ( voiceBox.listening ){
      voiceBox.waiting_for_response = false
      voiceBox.stopListening()
    }else{
      voiceBox.listen()
    }
  })
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // empty event to prevent app quiting when all windows are closed
});

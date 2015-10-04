var os = require('os');
var fs = require("fs");
var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var path = require('path');
var globalShortcut = require('global-shortcut');

require('electron-debug')();
require('crash-reporter').start();

voiceBox = require('./app/voicebox');
// load the responders manager
respondersManager = require('./app/responders_manager');
var settings = require('./app/settings');

var updater = require('./app/updater');
updater.checkForUpdate(app);


// Hide the dock icon
if(os.platform() === 'darwin')
  app.dock.hide();

// setting some chromium flags to enable window transparency on linux
if(os.platform() === 'linux'){
  app.commandLine.appendSwitch('enable-transparent-visuals');
  app.commandLine.appendSwitch('disable-gpu');
}

trayIcon = null;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Tray icon
  trayIcon = new Tray(settings.iconPath());
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Responders Manager',
      click: function(){
        respondersManager.open();
      }
    },
    {
      label: 'Settings',
      click: function(){
        settings.open();
      }
    },
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

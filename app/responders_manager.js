var os = require('os');
var fs = require('fs');
var app = require('app');
var path = require('path');
var dialog = require('dialog');
var request = require('request');
var notifier = require('node-notifier');
var childProcess = require('child_process');
var BrowserWindow = require('browser-window');

var window = undefined

// Add npm path to PATH...
// this is too much of a hack and needs improvement
process.env.PATH = [
  "/usr/local/bin",
  process.env.PATH,
].join(':')

function RespondersManager(){
  var self = this

  this.appDataPath = path.join(app.getPath('appData'), 'voicebox')
  this.respondersPath = path.join(self.appDataPath, 'responders')
  this.installedResponders = {}

  this.init = function(){
    self.loadStorage(function(){
      self.loadResponders();
      self.coreResponders();
    });
  }

  // opens the responders manager window
  this.open = function(){
    if ( !window ){
      window = new BrowserWindow({
        width: 700,
        height: 540,
        'min-width': 500,
        'min-height': 500
      });

      window.loadUrl('file://' + __dirname + '/../views/responders_manager.html');

      if (os.platform() === 'darwin'){ app.dock.show(); }

      window.on('closed', function(){
        window = undefined
        if (os.platform() === 'darwin'){ app.dock.hide(); }
      })
    }
  }

  // loadStorage is used to create the storage directories if they
  // do not exist and find the installed responders
  this.loadStorage = function(callback){
    // create voiceBox dir if it doesnt exist
    if (!fs.existsSync(self.appDataPath)){ fs.mkdirSync(self.appDataPath); }
    // create the responders dir if it doesnt exist
    if (!fs.existsSync(self.respondersPath)){ fs.mkdirSync(self.respondersPath); }
    // run the callback
    callback();
  }

  // loadResponders is used to load the currently installed responders
  this.loadResponders = function(){
    // iterate through the folders in the responders folder
    self.responderFolders().forEach(function(responder_folder){
      var responderPath = path.join(self.respondersPath, responder_folder);
      self.loadResponder(responderPath, function(responder){
        self.checkForUpdate(responder);
      });
    })
  }

  // returns the folders inside the responders directory
  this.responderFolders = function(){
    return fs.readdirSync(self.respondersPath).filter(function(file) {
      return fs.statSync(path.join(self.respondersPath, file)).isDirectory();
    });
  }

  // loadResponder loads a given responder from a path
  this.loadResponder = function(responderPath, callback){
    if (self.validResponder(responderPath)){
      // build the path to the responder
      var pathToPackage = self.pathTo(responderPath);
      // try to require it
      try {
        require(pathToPackage)
        // get the package json file and add it to the installedResponders object
        var responder = require(pathToPackage+'/package.json')
        self.installedResponders[responder.name] = responder
        self.installedRespondersUpdated()
        console.log('Loaded responder : '+responder.name);
        if ( callback ){ callback(responder.name); }
      } catch(err) {
        console.log(err);
      }
    }else{
      console.log(responderPath+' is not a valid responder');
    }
  }

  // installResponder installs a given responder name
  this.installResponder = function(responder){
    // if the responder is already installed
    if (self.validResponder(path.join(self.respondersPath, responder))){
      return;
    }else{
      // search the NPM registry for the package tarball URL so it can be downloaded
      request.get('https://registry.npmjs.com/'+responder+'/latest', function(err, response, body){
        var body = JSON.parse(body);
        // if the pacage exists
        if ( body.dist ){
          var tarballURL = body.dist.tarball;
          var responderVersion = body.version;
          // download the responder
          self.downloadResponder(responder, tarballURL, function(responderPath){
            self.loadResponder(responderPath);
            self.installedRespondersUpdated();
          });
        }else{
          self.message('Responder does not exist');
          return false;
        }
      });
    }
  }

  // downloads the tarball for a responder
  this.downloadResponder = function(responder, tarballURL, callback){
    // the path the tarball will be downloaded to
    var filePath = path.join(self.respondersPath, responder+'.tgz')
    var r = request.get(tarballURL)
    .on('error', function(){
      self.message('Failed to download responder')
      return false;
    })
    .on('response', function(){
      r.pipe(fs.createWriteStream(filePath));
    })
    .on('end', function(){
      // when its finished downloading, being unzipping the tarball
      self.unzipPackage(filePath, callback);
    })
  }

  // unzips a responder tarball
  this.unzipPackage = function(filePath, callback){
    // the extracted path is the same path without the .tgz
    var packagePath = filePath.slice(0, -4) + '/'
    if (!fs.existsSync(packagePath)){ fs.mkdirSync(packagePath); }
    // TODO: without this timeout some packages dont get extracted. Its temporary solution and needs to be improved.
    setTimeout(function(){
      childProcess.spawn('tar', ['-C', packagePath, '-xf', filePath, '--strip-components', 1])
      .on('exit', function(){
        fs.unlinkSync(filePath);
        self.installPackageDependencies(packagePath, callback);
      })
    }, 500)
  }

  // installPackageDependencies runs npm install inside a package directory
  this.installPackageDependencies = function(packagePath, callback){
    childProcess.spawn('npm', ['install'], {cwd: packagePath})
    .on('exit', function(){
      callback(packagePath);
    })
  }

  // Returns if a given path is a valid responder or not
  this.validResponder = function(responderPath){
    if (fs.existsSync(path.join(responderPath, '/package.json'))){
      return true
    }else{
      return false
    }
  }

  this.uninstallResponder = function(responder, callback){
    self.removeResponder(responder, function(){
      self.installedRespondersUpdated();
    })
  }

  this.removeResponder = function(responder, callback){
    var responderPath = path.join(self.respondersPath, responder)
    if ( self.validResponder(responderPath) ){
      childProcess.exec( 'rm -r ' + self.fixPath(responderPath), function ( err, stdout, stderr ){
        delete self.installedResponders[responder];
        // unrequire the file
        var pathToPackage = self.pathTo(responderPath);
        if (require.cache[pathToPackage]){ delete require.cache[pathToPackage]; }
        if ( callback ){ callback(); }
      });
    }
  }

  // checkForUpdate checks the NPM registry to get the latest version of a responder package
  this.checkForUpdate = function(responder){
    // search the NPM registry for the package tarball URL so it can be downloaded
    request.get('https://registry.npmjs.com/'+responder+'/latest', function(err, response, body){
      var body = JSON.parse(body);
      // if the pacage exists
      if ( body.dist && self.installedResponders[responder].version != body.version){
        self.installedResponders[responder].updated_available = true
        notifier.notify({
          'title': 'VoiceBox',
          icon: path.join(__dirname, '../assets/images/icon.png'),
          'message': 'An update is available for the '+responder+' responder'
        });
        self.installedRespondersUpdated();
      }
    });
  }

  // updates a given responder
  this.updateResponder = function(responder){
    self.removeResponder(responder, function(){
      self.installResponder(responder);
    })
  }

  this.installedRespondersUpdated = function(){
    if ( window ){
      window.webContents.send('installed_responders_updated', self.installedResponders)
    }
  }

  this.fixPath = function(path){
    return path.replace(" ", "\\ ");
  }

  // opens a file dialog to install a responder from a folder
  this.installFromDir = function(){
    dialog.showOpenDialog(window, {properties: ['openDirectory']}, function(folderPath){
      if ( folderPath ){
        var folderPath = folderPath[0];
        var packageJsonPath = path.join(folderPath, 'package.json');
        if (fs.existsSync(packageJsonPath)){
          var responder = require(self.pathTo(packageJsonPath));
          var responderPath = path.join(self.respondersPath, responder.name)
          fs.symlink(folderPath, responderPath, function(){
            self.loadResponder(responderPath)
          });
        }
      }
    });
  }

  // builds the path to a given folder from the current directory
  this.pathTo = function(folder){
    return path.relative(__dirname, folder)
  }

  this.coreResponders = function(){
    this.installResponder('voicebox-maths')
    this.installResponder('voicebox-timers')
    this.installResponder('voicebox-basics')
    this.installResponder('voicebox-weather')
  }

  // displays a message if the responders manager window is open
  this.message = function(message){
    dialog.showMessageBox(window, {
      message: message,
      buttons: ['Ok']
    })
  }

  // call the init function
  this.init();
}

module.exports = new RespondersManager()

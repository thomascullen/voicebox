var fs = require('fs');
var app = require('app');
var path = require('path');
var request = require('request');
var childProcess = require('child_process');
var exec = require( 'child_process' ).exec;
var BrowserWindow = require('browser-window');

function RespondersManager(){
  var self = this

  this.appDataPath = path.join(app.getPath('appData'), 'voicebox')
  this.respondersPath = path.join(self.appDataPath, 'responders')
  this.respondersStorage = path.join(self.respondersPath, 'responders.json')
  this.installedResponders = {}
  this.window = undefined

  // called when the RespondersManager is initialized
  this.init = function(){
    self.loadStorage(function(){
      self.loadResponders();
      self.defaultResponders();
    });
  }

  this.open = function(){
    self.window = new BrowserWindow({
      width: 600,
      height: 460,
      resizable: false
    });

    self.window.loadUrl('file://' + __dirname + '/../views/responders_manager.html');
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
    var installedResponders = self.installedResponders;
    self.responderFolders().forEach(function(responder){
      self.loadResponder(responder, function(){
        self.checkForUpdate(responder);
      });
    })
  }

  this.responderFolders = function(){
    return fs.readdirSync(self.respondersPath).filter(function(file) {
      return fs.statSync(path.join(self.respondersPath, file)).isDirectory();
    });
  }

  // loadResponder loads a given responder
  this.loadResponder = function(responder, callback){
    if (self.responderInstalled(responder)){
      // require the responder
      var packagePath = path.join(self.respondersPath, responder);
      var pathToPackage = path.relative(__dirname, packagePath);
      try {
        require(pathToPackage)
        // get the package json file
        var packageJson = require(pathToPackage+'/package.json')
        self.installedResponders[responder] = packageJson
        console.log('Loaded responder : '+responder);
        if ( callback ){ callback(); }
      } catch(err) {
        console.log(err);
      }
    }
  }

  // installResponder is used to begin the process of installing a responder
  this.installResponder = function(responder){
    if (self.responderInstalled(responder)){
      return;
    }else{
      // search the NPM registry for the package tarball URL so it can be downloaded
      request.get('https://registry.npmjs.com/'+responder+'/latest', function(err, response, body){
        var body = JSON.parse(body);
        // if the pacage exists
        if ( body.dist ){
          var tarballURL = body.dist.tarball;
          var responderVersion = body.version;
          self.downloadResponder(responder, tarballURL, function(){
            self.installedResponders[responder] = {
              version: responderVersion
            }
            self.loadResponder(responder);
            self.installedRespondersUpdated();
          });
        }else{
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
      return false;
      console.log('failed to download package');
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
    fs.mkdirSync(packagePath);
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
      callback();
    })
  }

  // checks if a given responders has already been installed
  this.responderInstalled = function(responder){
    if (fs.existsSync(path.join(self.respondersPath, responder+'/package.json'))){
      return true
    }else{
      return false
    }
  }

  this.uninstallResponder = function(responder, callback){
    if ( self.responderInstalled(responder) ){
      var responderPath = path.join(self.respondersPath, responder)
      exec( 'rm -r ' + self.fixPath(responderPath), function ( err, stdout, stderr ){
        delete self.installedResponders[responder];
        self.installedRespondersUpdated();
        if ( callback ){ callback(); }
      });
    }
  }

  this.checkForUpdate = function(responder){
    // search the NPM registry for the package tarball URL so it can be downloaded
    request.get('https://registry.npmjs.com/'+responder+'/latest', function(err, response, body){
      var body = JSON.parse(body);
      // if the pacage exists
      if ( body.dist && self.installedResponders[responder].version != body.version){
        self.installedResponders[responder].updated_available = true
        self.installedRespondersUpdated();
      }
    });
  }

  this.updateResponder = function(responder){
    self.uninstallResponder(responder, function(){
      self.installResponder(responder);
    })
  }

  this.installedRespondersUpdated = function(){
    if ( self.window ){
      self.window.webContents.send('installed_responders_updated', self.installedResponders)
    }
  }

  this.fixPath = function(path){
    return path.replace(" ", "\\ ");
  }

  this.defaultResponders = function(){
    this.installResponder('voicebox-maths')
    this.installResponder('voicebox-timers')
    this.installResponder('voicebox-basics')
    this.installResponder('voicebox-weather')
  }

  // call the init function
  this.init();
}

module.exports = new RespondersManager()

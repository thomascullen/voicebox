var fs = require('fs');
var Decompress = require('decompress');
var spawn = require('child_process').spawn;
var npm = require("npm");
var app = require('app');
var zlib = require('zlib');
var path = require('path');
var request = require('request');

var voiceBoxPath = path.join(app.getPath('home'), '.voicebox')
var respondersPath = path.join(voiceBoxPath, 'responders')
var respondersJsonPath = path.join(respondersPath, 'responders.json')
var NPMRegistry = 'https://registry.npmjs.com/'

// create voiceBox dir if it doesnt exist
if (!fs.existsSync(voiceBoxPath)){ fs.mkdirSync(voiceBoxPath); }

// create the responders dir if it doesnt exist
if (!fs.existsSync(respondersPath)){ fs.mkdirSync(respondersPath); }

// create the responders.json file if it doesnt exist
if (!fs.existsSync(respondersJsonPath)){ fs.writeFile(respondersJsonPath, '{}'); }

// create a symlink to the responders directory
if (!fs.existsSync('responders')){ fs.symlinkSync(respondersPath, 'responders'); }

// load the installed responders
loadResponders();
// read the respondersJSON to install new responders
readRespondersJson();

// load the responders
function loadResponders(){
  installedResponders().forEach(function(responder){
    require('../responders/'+responder);
  })
}

// returns an array of the installed responders
function installedResponders() {
  return fs.readdirSync(respondersPath).filter(function(file) {
    return fs.statSync(path.join(respondersPath, file)).isDirectory();
  });
}

// # readRespondersJson
// reads the responders json file
function readRespondersJson(){
  var responders = [];
  var respondersJson = JSON.parse(fs.readFileSync(respondersJsonPath, 'utf8'));
  for ( var responder in respondersJson ){
    responders.push({
      title: responder,
      version: respondersJson[responder]
    });
  }
  // load the responders
  installResponders(responders);
}

// install the list of responders
function installResponders(responders){
  var installed_responders = installedResponders()
  responders.forEach(function(responder){
    var responder_name = responder.title+'-'+responder.version
    if ( installed_responders.indexOf(responder_name) == -1 ) {
      installResponder(responder, function(){
        console.log('installed and loaded '+responder_name);
        require('../responders/'+responder_name);
      });
    }
  });
}

// install a given responder
function installResponder(responder, callback){
  // make a request to NPMRegistry
  request.get(NPMRegistry+responder.title+'/'+responder.version, function(error, response, body){
    // get the url for the tarball so we can download it
    var body = JSON.parse(body)
    var tarballPath = body.dist.tarball
    // the path for the downloaded tarball
    var filePath = path.join(respondersPath, responder.title+'-'+responder.version+'.tgz')

    // begin downloading the tarball
    var r = request.get(tarballPath)
      .on('error', function(){ console.log('failed to download package'); })
      .on('response', function(){
        r.pipe(fs.createWriteStream(filePath));
      })
      .on('end', function(){
        // when its finished downloading, being unzipping the tarball
        unzipPackage(filePath, callback);
      })
  });
}

// unzip a given .tgz file
function unzipPackage(filePath, callback){
  // the extracted path is the same path without the .tgz
  var packagePath = filePath.slice(0, -4)

  // extract the file
  new Decompress({mode: '755'})
      .src(filePath)
      .dest(packagePath)
      .use(Decompress.targz({strip: 1}))
      .run(function(){
        // delete the .tgz after it has been extracted
        fs.unlink(filePath, function(){
          // install the package dependencies after the .tgz has been deleted
          installPackageDependencies(packagePath, callback);
        });
      });
}

// install the package dependencies for a given path
function installPackageDependencies(packagePath, callback){
  // change the process context into the packagePath
  process.chdir(packagePath+'/');
  // load npm and install the dependencies
  npm.load(function (err) {
    npm.commands.install([], function (er, data) {
      // run the callback passed into installResponder when npm install is finished
      callback()
    });
  });
}

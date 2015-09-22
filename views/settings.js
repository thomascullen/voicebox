var ipc = require('ipc');

ipc.send('get_config')
ipc.on('voicebox_config', function(config){
    document.getElementById('launch_on_startup').checked = config.launch_on_startup
})

function launchOnStartup(input){
  ipc.send('save_setting', 'launch_on_startup', input.checked)
}

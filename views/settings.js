var ipc = require('ipc');

ipc.send('get_config')
ipc.on('voicebox_config', function(config){
    document.getElementById('dark_menu_tray_icon').checked = config.dark_menu_tray_icon
})

function darkMenuTrayIcon(input){
  ipc.send('save_setting', 'dark_menu_tray_icon', input.checked)
}

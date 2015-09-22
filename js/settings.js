var ipc = require('ipc');

ipc.send('save_setting', 'launch_on_startup', true);

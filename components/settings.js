'use babel';

import React from 'react';

var ipc = require('ipc');
var Configstore = require('configstore');
var config = new Configstore('voicebox_config');

class Settings extends React.Component {

  constructor(props) {
    super(props);
    this.state = config.all
  }

  darkMenuIcon(e){
    var value = e.target.checked
    config.set('dark_menu_tray_icon', value);
    this.setState({ dark_menu_tray_icon: value});
    ipc.send('update_tray_icon')
  }

  render() {
    var checked = this.state.dark_menu_tray_icon
    return (
      <div className='settings'>
        <div className="settings_header">
          <div className="icon"></div>
        </div>
        <div className="settings_body">
          <div className="setting">
            <input type="checkbox" ref='dark_menu_tray_icon' defaultChecked={this.state.dark_menu_tray_icon} onChange={this.darkMenuIcon}/>
            <label htmlFor='dark_menu_tray_icon'>Dark menu tray icon.</label>
          </div>
        </div>
      </div>
    )
  }
}

React.render(<Settings />, document.body);

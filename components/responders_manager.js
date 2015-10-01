'use babel';

import React from 'react';
import remote from 'remote'
var manager = remote.getGlobal('respondersManager');

class RespondersManager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      responders: manager.installedResponders
    }
  }

  install(){
    var input = this.refs.responder.getDOMNode();
    var value = input.value;
    if ( value.length > 0 ){
      manager.installResponder(value)
      input.value = ''
    }
  }

  uninstall(responder){
    manager.uninstallResponder(responder);
  }

  render() {
    var self = this
    var responders = Object.keys(this.state.responders).map(function(responder, i){
      return (
        <li key={i}>
          <h5>{responder}</h5>
          <button onClick={self.uninstall.bind(self, responder)}>Uninstall</button>
        </li>
      )
    })

    return (
      <div className='responders_manager'>
        <h2>Install a responder</h2>
        <input type='text' ref='responder' placeholder='responder title..' />
        <button onClick={this.install.bind(this)}>Install</button>
        <h2>Responders</h2>
        {responders}
      </div>
    )
  }
}

React.render(<RespondersManager />, document.body);

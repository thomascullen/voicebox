'use babel';

import ipc from 'ipc';
import React from 'react';
import remote from 'remote';
var manager = remote.getGlobal('respondersManager');

class RespondersManager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      responders: manager.installedResponders
    }
  }

  componentDidMount(){
    var self = this

    ipc.on('installed_responders_updated', function(responders) {
      self.setState({ responders: responders })
    });
  }

  install(e){
    e.preventDefault()
    var input = this.refs.responder.getDOMNode();
    var value = input.value;
    if ( value.length > 0 ){
      manager.installResponder(value)
      input.value = ''
    }
  }

  installFromDir(){
    manager.installFromDir();
  }

  update(responder){
    manager.updateResponder(responder);
  }

  uninstall(responder){
    manager.uninstallResponder(responder);
  }

  render() {
    var self = this
    var responders = Object.keys(this.state.responders).map(function(responder, i){

      var updateButton
      if ( self.state.responders[responder].updated_available ){
        updateButton = <button onClick={self.update.bind(self, responder)}>Update</button>
      }


      return (
        <li key={i}>
          <span className='version'>v.{self.state.responders[responder].version}</span>
          <h4>{self.state.responders[responder].name}</h4>
          <p>{self.state.responders[responder].description}</p>
          <button onClick={self.uninstall.bind(self, responder)}>Uninstall</button>
          {updateButton}
        </li>
      )
    })

    return (
      <div className='responders_manager'>
        <div className='install_responder'>
          <h2>Install a responder</h2>
          <form onSubmit={this.install.bind(this)}>
            <input type='text' ref='responder' placeholder='responder title..' />
            <input type='submit' value='Install' />
          </form>
          <button onClick={this.installFromDir.bind(this)}>Install From Dir</button>
        </div>
        <ul className='responders'>
          <h3>Installed Responders</h3>
          {responders}
        </ul>
      </div>
    )
  }
}

React.render(<RespondersManager />, document.body);

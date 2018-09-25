import React from 'react';
import Popup from "reactjs-popup";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './TextInput.css';

const ENTER_KEY_CODE = 13;

var allInstances = []; // prevent annoying opening of multiple tooltips simultaneously

class TextInput extends React.Component {

  constructor(props) {
    super(props);
    this.placeholder = props.placeholder;
    this.onSave = props.onSave || (() => {});
    this.state = {
      value: props.value || '',
      popupOpen: false
    };
    allInstances.push(this);
  }
  

static propTypes = {};

 async _onChange(event) {
    await this.setState({
      value: event.target.value
    });
    this.onSave(this.state.value);
  }

  _save() {
    this.onSave(this.state.value);
  }

  _onKeyDown(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      this._save();
    }
  }

  async onOpen()
  {
    this.setState({popupOpen:true});
    allInstances.forEach(item =>
      {
        if (item !== this && item.state.popupOpen)
          item.close();
      });
  }

  close()
  {
    this.setState({popupOpen:false});
  }

  render() {
    return (
        <Popup on='hover' open={this.state.popupOpen} onOpen={this.onOpen.bind(this)} contentStyle={{"width":"400px","borderRadius":"5px","textAlign":"justify"}}
          trigger={(
            <input
                className={this.props.className}
                type="text"
                maxLength={this.props.maxLength}
                onChange={this._onChange.bind(this)}
                onKeyDown={this._onKeyDown.bind(this)}
                placeholder={this.placeholder}
                value={this.state.value} />
        )}>
            <span>{this.props.hint}</span>
        </Popup>
    );
  }
}

export default withStyles(s)(TextInput);
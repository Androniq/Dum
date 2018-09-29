import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './BlueButton.css';

class BlueButton extends React.Component {
    static propTypes = {};

    constructor(props)
    {
      super(props);
    }

  render() {
    return (
        <button className={cx(s.blueButton, this.props.className)} onClick={this.props.onClick}>{this.props.children}</button>
    );
  }
}

export default withStyles(s)(BlueButton);
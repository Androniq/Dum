import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './StickyMessage.css';
import PropTypes from 'prop-types';

class StickyMessage extends React.Component {
    static propTypes = {
        message: PropTypes.string,
        visible: PropTypes.number
    };

    state = { visibilityStyle: s.invisible };

    constructor(props)
    {
      super(props);
    }

  render() {
    return (
        <div className={cx(s.sticky, this.props.visible ? this.props.visible === 2 ? s.visible : s.invisible : s.nodisplay)}>
            <span className={s.stickyMessage}>{this.props.message}</span>
        </div>
    );
  }
}

export default withStyles(s)(StickyMessage);
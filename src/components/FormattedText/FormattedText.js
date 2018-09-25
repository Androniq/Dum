import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FormattedText.css';
import PropTypes from 'prop-types';

class FormattedText extends React.Component {
    static propTypes = {
        html: PropTypes.string
    };

    constructor(props)
    {
      super(props);
    }

  render() {
    return (
      <span className={s.outerSpan}>
        <span dangerouslySetInnerHTML={{__html: this.props.html}} />
      </span>
    );
  }
}

export default withStyles(s)(FormattedText);
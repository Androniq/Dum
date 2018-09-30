/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorPage.css';
import withEverything from '../../withEverything';

class ErrorPage extends React.Component {
  static propTypes = {
    error: PropTypes.shape({
      name: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      stack: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    error: null,
  };

  render() {
    if (__DEV__ && this.props.error) {
      return (
        <div>
          <h1>{this.props.error.name}</h1>
          <pre>{this.props.error.stack}</pre>
        </div>
      );
    }

    return (
      <div className={s.errorContainer}>
        <h1>Помилка</h1>
        {this.props.status ? (
          <h2>Код {this.props.status}</h2>
        ) : null}
        {this.props.message ? (
          <h2>Повідомлення від сервера: {this.props.message}</h2>
        ) : null}
        {this.props.localMessage ? (
          <span>{this.props.localMessage}</span>
        ) : null}
        <p>Гой! Думаву, йсе Закарпаттє. Туй шо інтернету не є, шо літературної української мови.</p>
      </div>
    );
  }
}

const withEv = withEverything(ErrorPage, s, null, { status: 404, localMessage: 'Нема такої сторінки' });

export { ErrorPage as ErrorPageWithoutStyle };
export { withEv as ErrorPageWithEverything };
export default withStyles(s)(ErrorPage);

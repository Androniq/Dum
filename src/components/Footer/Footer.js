/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Footer.css';
import { Link } from 'react-router-dom';

class Footer extends React.Component {
  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <span className={s.text}>© ДУМ 2019</span>
          <span className={s.spacer}>·</span>
          <Link className={s.link} to="/">
            Домівка
          </Link>
          <span className={s.spacer}>·</span>
          <Link className={s.link} to="/privacy">
            Приватність
          </Link>
          <span className={s.spacer}>·</span>
          <Link className={s.link} to="/not-found">
            404
          </Link>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Footer);

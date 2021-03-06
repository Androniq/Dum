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
import s from './HeaderBrowser.css';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import logoUrl from '../Header/logo-small.png';
import logoUrl2x from '../Header/logo-small@2x.png';
import logo from '../Header/logo.png';

class HeaderBrowser extends React.Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {        
    return (
        <div className={s.root}>
          <div className={s.container}>
            <Link className={s.brand} to="/">
              <img
                src={logo}
                srcSet={`${logoUrl2x} 2x`}
                width="38"
                height="38"
                alt="ДУМ"
                />
              <span className={s.brandTxt}>ДУМ</span>
            </Link>
            <Navigation className={s.navigation} context={this.props.context} />
          </div>
        </div>
    );
  }
}

export default withStyles(s)(HeaderBrowser);

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';
import { UserContext } from '../../UserContext.js';
import { checkPrivilege, USER_LEVEL_MODERATOR } from '../../utility';

class Navigation extends React.Component
{
  render()
  {    
    return (
      <div className={s.root} role="navigation">
        <div className={s.linkPanel}>
        <Link className={s.link} to="/">
          Домівка
        </Link>
        <Link className={s.link} to="/blog/whatisdum">
          Що таке ДУМ
        </Link>
        <Link className={s.link} to="/blog/principles">
          Принципи
        </Link>
        <Link className={s.link} to="/blog/zunpa">
          ЗУНПА
        </Link>
        <UserContext.Consumer>
          {context => checkPrivilege(context.user, USER_LEVEL_MODERATOR) ? (
              <Link className={s.link} to="/editArticle/new">
                Написати статтю
              </Link>
            ) : ""}
        </UserContext.Consumer>
        </div>
        <span className={s.spacer}> | </span>
        <div className={s.userPanel}>
        <UserContext.Consumer>
          {context => context.user ? (
            <React.Fragment>
              <Link className={s.link} to="/account">
                <img src={context.user.photo} className={s.profilePicture} />
              </Link>
              <div className={s.verticalPanel}>
                <Link className={s.link} to="/account">
                  <span>{context.user.displayName}</span>
                </Link>
                <a className={cx(s.link, s.logoutLink)} href={"/logout?returnTo=" + context.pathname}>
                  Вийти
                </a>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <span className={s.spacer}> | </span>
              <Link className={s.link} to={{pathname: "/login", state: { returnTo: context.pathname }}}>
                Увійти
              </Link>
              <span className={s.spacer}>чи</span>
              <Link className={cx(s.link, s.highlight)} to="/register">
                Зареєструватися
              </Link>
            </React.Fragment>
          )}
        </UserContext.Consumer>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);

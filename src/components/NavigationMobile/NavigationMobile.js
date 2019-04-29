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
import s from './NavigationMobile.css';
import { Link } from 'react-router-dom';
import { checkPrivilege, USER_LEVEL_MODERATOR, DEFAULT_USERPIC, USER_LEVEL_MEMBER } from '../../utility';

class NavigationMobile extends React.Component
{
    render()
    {    
        return (
            <div className={s.root} role="navigation">
                <div className={s.container}>
                    {this.props.context.user ? (
                        <React.Fragment>
                            <div className={s.item}>
                                <Link className={s.link} to="/account">
                                    <div className={s.userPanel}>
                                        <img className={s.userpic} src={this.props.context.user.photo || DEFAULT_USERPIC} />
                                        <span className={s.userName}>{this.props.context.user.displayName}</span>
                                    </div>
                                </Link>
                            </div>
                            <div className={s.item}>
                                <Link className={s.link} to="/logout">Вийти</Link>
                            </div>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <div className={s.item}>
                                <Link className={s.link} to="/login">Увійти</Link>
                            </div>
                        </React.Fragment>
                    )}
                    <div className={s.item}>
                        <Link className={s.link} to="/">Домівка</Link>
                    </div>
                    <div className={s.item}>
                        <Link className={s.link} to="/blog/whatisdum">Що таке ДУМ</Link>
                    </div>
                    <div className={s.item}>
                        <Link className={s.link} to="/blog/principles">Принципи</Link>
                    </div>
                    <div className={s.item}>
                        <Link className={s.link} to="/blog/zunpa">ЗУНПА</Link>
                    </div>
                    {checkPrivilege(this.props.context.user, USER_LEVEL_MODERATOR) ? (
                        <div className={s.item}>
                            <Link className={s.link} to="/editArticle/new">Написати статтю</Link>
                        </div>
                    ) : checkPrivilege(this.props.context.user, USER_LEVEL_MEMBER) ? (
                        <div className={s.item}>
                            <Link className={s.link} to="/proposeArticle">Запропонувати статтю</Link>
                        </div>
                    ) : null}
                </div>
            </div>
        );        
    }
}

export default withStyles(s)(NavigationMobile);

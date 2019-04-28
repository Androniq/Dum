import React from 'react';
import PropTypes from 'prop-types';
import s from './UserList.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal } from '../../utility';

class UserList extends React.Component
{
    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>Список користувачів</title>
                </Helmet>
                <div className={s.list}>
                    {this.props.data.users.map(item => (
                        <div key={item._id} className={s.listItem}>
                            <div className={s.userpicContainer}>
                                <img src={item.photo || DEFAULT_USERPIC} className="userpic" />
                            </div>
                            <span className={s.userName}>{item.displayName}
                                <span className={s.itsYou}>{item._id.toString() === this.props.context.user._id ? "(це ви)" : null}</span>
                            </span>
                            <span className={s.role}>{userRoleToLocal(item.role)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(UserList, s, '/api/getUserList');

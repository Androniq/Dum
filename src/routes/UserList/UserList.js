import React from 'react';
import PropTypes from 'prop-types';
import s from './UserList.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal, goToLink } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class UserList extends React.Component
{
    async viewUser(id)
    {
        goToLink(this, '/viewProfile/' + id);
    }

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
                            <BlueButton className={s.viewButton} onClick={(()=>this.viewUser(item._id.toString())).bind(this)}>Переглянути</BlueButton>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(UserList, s, '/api/getUserList');

import React from 'react';
import PropTypes from 'prop-types';
import s from './UserList.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';

class UserList extends React.Component
{
    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>UserList</title>
                </Helmet>
            </div>
        );
    }
}

export default withEverything(UserList, s, '/api/getUserList');

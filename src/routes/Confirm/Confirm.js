import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Confirm.css';
import classnames from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { throws } from 'assert';

class Confirm extends React.Component
{
    componentDidMount()
    {
        if (this.props.data.success)
        {
            if (this.props.context.user)
                this.props.context.user.confirmed = true;
        }
    }    
    
    render()
    {
        return (
            <div className={s.container}>
                <Helmet>
                    <title>Підтвердження адреси електронної пошти</title>
                </Helmet>
                <h3>Підтвердження адреси</h3>
                {this.props.data.success ? (
                    <div>Вітаємо! Ви успішно підтвердили свою адресу електронної пошти.</div>
                ) : (
                    <div>Щось пішло не так... {this.props.data.localMessage}</div>
                )}
            </div>
        );
    }
}

export default withEverything(Confirm, s, '/api/confirm/:token');
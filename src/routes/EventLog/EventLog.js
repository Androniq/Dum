import React from 'react';
import PropTypes from 'prop-types';
import s from './EventLog.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';

class EventLog extends React.Component
{
    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>EventLog</title>
                </Helmet>
            </div>
        );
    }
}

export default withEverything(EventLog, s, '/api/getEventLog');

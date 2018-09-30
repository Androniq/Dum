import React from 'react';
import PropTypes from 'prop-types';
import s from './Approvals.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';

class Approvals extends React.Component
{
    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>Approvals</title>
                </Helmet>
            </div>
        );
    }
}

export default withEverything(Approvals, s, '/api/getApprovals');
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
                    <title>Пропозиції</title>
                </Helmet>
                <div className={s.itemList}>
                    {this.props.data.proposedArgs.map(item => (
                        <div key={item._id} className={s.itemContainer}>
                            <span>{item.Content}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(Approvals, s, '/api/getApprovals');
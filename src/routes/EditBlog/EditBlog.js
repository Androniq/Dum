import React from 'react';
import PropTypes from 'prop-types';
import s from './EditBlog.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';

class EditBlog extends React.Component
{
    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>EditBlog</title>
                </Helmet>
            </div>
        );
    }
}

export default withEverything(EditBlog, s);

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loading.css';

class Loading extends React.Component
{
    render()
    {
        return (
            <div className={s.container}>
                <div className={s.absoluteContainer}>
                    <div className={s.circle1} />
                    <div className={s.circle2} />
                    <span className={s.loaderText}>Завантаження...</span>
                </div>
            </div>
        );
    }
}

export default withStyles(s)(Loading);
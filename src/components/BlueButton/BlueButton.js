import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './BlueButton.css';
import { keyboardOptions } from '../../utility';

class BlueButton extends React.Component
{
    static propTypes = {};

    constructor(props)
    {
        super(props);
    }

    onClickEnv(e)
    {
        keyboardOptions.ctrl = e && e.ctrlKey || false;
        if (this.props.onClick)
            this.props.onClick();
    }

    render()
    {
        return (
            <button className={cx(s.blueButton, this.props.className)} onClick={this.onClickEnv.bind(this)}>
                {this.props.redDot?(
                    <div className={s.redDot} />
                ):null}
                <span>{this.props.children}</span>
            </button>
        );
    }
}

export default withStyles(s)(BlueButton);
import React from 'react';
import PropTypes from 'prop-types';
import Popup from "reactjs-popup";
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './VoteButton.css';
import classnames from 'classnames';
import FormattedText from '../FormattedText/FormattedText';

class VoteButton extends React.Component
{
    static propTypes =
    {
        code: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        ownVote: PropTypes.string.isRequired,
        hint: PropTypes.string
    };
    
    state =
    {
    };

    constructor(props)
    {
        super(props);
        this.state.colorStyle = this.getColorStyle(this.props.code);
        this.state.buttonStyle = this.getButtonStyle(this.props.code);
    }

    getColorStyle(code)
    {
        switch (code)
        {
            case 'A':
            case 'B':
                return s.pvButtonRed;
            case 'AB':
            case 'BA':
                return s.pvButtonYellow;
            case 'EQ':
                return s.pvButtonGreen;
            case 'S':
                return s.pvButtonBlue;
        }
        throw { sender: this, message: "Wrong VoteButton code: " + code };
    }

    getButtonStyle(code)
    {
        switch (code)
        {
            case 'A': return s.pvButtonA;
            case 'AB': return s.pvButtonAB;
            case 'EQ': return s.pvButtonEQ;
            case 'BA': return s.pvButtonBA;
            case 'B': return s.pvButtonB;
            case 'S': return s.pvButtonS;
        }
        throw { sender: this, message: "Wrong VoteButton code: " + code };
    }

    cssHighlight(code)
    {
        if (code === this.props.ownVote)
        {
            return s.pvButtonCurrent;
        }
        return null;
    }

    getPopupPosition(code)
	{
		switch (code)
		{
			case 'A':
			case 'AB':
				return "top center";
			case 'BA':
			case 'B':
				return "bottom center";
			case 'EQ':
				return "right center";
			case 'S':
				return "left center";
		}
	}

    render()
    {
        return (
            <Popup on="hover" contentStyle={{"width":"400px","borderRadius":"5px","textAlign":"left"}}
                position={this.getPopupPosition(this.props.code)}
                trigger={(
                <button className={classnames(s.pvButtonBase, this.state.colorStyle, this.state.buttonStyle, this.cssHighlight(this.props.code))}
                    onClick={this.props.onClick}>
                    {this.props.children}
                </button>
                )}>
                <FormattedText html={this.props.hint} />
            </Popup>
            );
    }
}

export default withStyles(s)(VoteButton);
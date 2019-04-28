import React from 'react';
import PropTypes from 'prop-types';
import s from './Notifications.css';
import cx from 'classnames';
import Popup from "reactjs-popup";
import { showSticky, dateToRelative, DEFAULT_USERPIC } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import { Link } from 'react-router-dom';
import withEverything from '../../withEverything';
import { Helmet } from 'react-helmet';

class Notifications extends React.Component
{
    state = {
        selectedIds: []
    };
    
    itemSelectionChanged(item)
    {
        return () =>
        {
            var isSelected = this.state.selectedIds.includes(item._id);
            if (isSelected)
                this.setState({ selectedIds: this.state.selectedIds.filter(it => it != item._id) });
            else
                this.setState({ selectedIds: [...this.state.selectedIds, item._id] });
        };
    }

    selectAll()
    {
        this.setState({ selectedIds: this.props.data.notifications.map(it => it._id) });
    }
    
    selectNone()
    {
        this.setState({ selectedIds: [] });
    }
    
    render()
    {
        var users = this.props.data.users;
        this.props.data.notifications.forEach(item =>
        {
            item.sender = users.find(it => it._id.toString() === item.from) || {};
        });    
        return (
            <div className="container">
                <Helmet>
                    <title>Сповіщення</title>
                </Helmet>
                <h2>Сповіщення</h2>
                <div className={s.managementPanel}>
                    <BlueButton>Позначити все як прочитане</BlueButton>
                    <BlueButton onClick={this.selectAll.bind(this)}>Виділити все</BlueButton>
                    <BlueButton onClick={this.selectNone.bind(this)}>Зняти виділення</BlueButton>
                    <BlueButton>Видалити</BlueButton>
                </div>
                <div className={s.notifList}>
                {this.props.data.notifications.map(item => (
                    <div key={item._id} className={s.notifContainer}>
                        <div className={cx(s.notifUnread, item.unread ? s.visible : s.hidden)} />
                        <input type="checkbox" className={s.selected} checked={this.state.selectedIds.includes(item._id)}
                            onInput={this.itemSelectionChanged(item).bind(this)} />
                        <div className={s.sender}>
                            <img src={item.sender.photo || DEFAULT_USERPIC} className={s.senderUserpic} />
                            <span className={s.senderName}>{item.sender.displayName}</span>
                        </div>
                        <span className={s.date}>{dateToRelative(item.DateCreated)}</span>
                        <span className={s.text}>{item.text}</span>
                    </div>
                ))}
                </div>
            </div>
        );
    }
}

export default withEverything(Notifications, s, '/api/getNotifications');
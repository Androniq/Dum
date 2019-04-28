import React from 'react';
import PropTypes from 'prop-types';
import s from './ViewHistory.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal, checkPrivilege, USER_LEVEL_ADMIN, USER_LEVEL_MEMBER, USER_LEVEL_MODERATOR, showSticky } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class ViewHistory extends React.Component
{
    numericEnding(number)
    {
        if (number < 0) return null;
        number = Math.floor(number);
        if (number <= 1) return "у";
        if (number <= 4) return "и";
        if (number <= 20) return "";
        if (number <= 99)
            return this.numericEnding(number % 10);
        return this.numericEnding(number % 100);
    }

    userFriendlyTimestamp(stamp, now)
    {
        if (stamp > now)
            return "Майбутнє?";
        var diff = (now - stamp) / 1000; // seconds
        if (diff < 60)
            return "Щойно";
        diff /= 60; // minutes
        if (diff <= 59)
            return Math.floor(diff) + " хвилин" + this.numericEnding(diff) + " тому";
        diff /= 60; // hours
        if (diff <= 23)
            return Math.floor(diff) + " годин" + this.numericEnding(diff) + " тому";
        return stamp.toLocaleDateString();
    }

    localAction(action)
    {
        switch (action)
        {
            case "CreateArticle": return "Створив статтю";
            case "UpdateArticle": return "Відредагував статтю";
            case "DeleteArticle": return "Видалив статтю";
            case "CreateArgument": return "Додав аргумент";
            case "UpdateArgument": return "Змінив аргумент";
            case "DeleteArgument": return "Видалив аргумент";
            case "ApproveArgument": return "Схвалив аргумент";
            case "ApproveCounterArgument": return "Схвалив контраргумент";
            case "RejectArgument": return "Відхилив аргумент";
        }
        return action;
    }

    async gotoChange(id)
    {
        this.props.history.push('/viewChange/' + id);
    }

    getPhoto(id, list)
    {
        var user = list.find(it => it._id === id);
        return user && user.photo || DEFAULT_USERPIC;
    }
    
    getName(id, list)
    {
        var user = list.find(it => it._id === id);
        return user && user.displayName || "Видалений користувач";
    }

    render()
    {
        var now = new Date();
        return (
            <div className="container">
                <Helmet>
                    <title>Перегляд історії</title>
                </Helmet>
                <div>
                    <span>Це перегляд історії змін статті «{this.props.data.articleName}».</span>
                </div>
                <div className={s.historyView}>
                    {this.props.data.history.map(item => (
                        <div key={item._id} className={s.historyItem}>
                            <img className={s.userpic} src={this.getPhoto(item.User, this.props.data.users)} />
                            <span className={s.username}>{this.getName(item.User, this.props.data.users)}</span>
                            <span className={s.timestamp}>{this.userFriendlyTimestamp(new Date(item.Time), now)}</span>
                            <span className={s.action}>{this.localAction(item.Action)}</span>
                            <BlueButton className={s.gotoChange} onClick={(()=>this.gotoChange(item._id)).bind(this)}>Переглянути зміну</BlueButton>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(ViewHistory, s, '/api/getHistory/:id');

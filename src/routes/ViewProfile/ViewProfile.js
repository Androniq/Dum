import React from 'react';
import PropTypes from 'prop-types';
import s from './ViewProfile.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal, checkPrivilege, USER_LEVEL_ADMIN, USER_LEVEL_MEMBER, USER_LEVEL_MODERATOR, showSticky } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class ViewProfile extends React.Component
{
    userRolePanel(role)
    {
        switch (role)
        {
            case 'visitor': return (
                <span>Гість</span>
            );
            case 'member': return (
                <span>Учасник</span>
            );
            case 'moderator': return (
                <span>Модератор</span>
            );
            case 'admin': return (
                <span>Адміністратор</span>
            );
            case 'owner': return (
                <span>Власник сайту</span>
            );
        }
        return null;
    }

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

    async alterLevel(newLevel)
    {
        var requestBody = { id: this.props.data.viewedUser._id, level: newLevel };
        var resp = await this.props.context.fetch('/api/setRole', { method: 'POST', body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json" }});
        var rj = await resp.json();
        if (rj.success)
        {
            showSticky(this, 'Роль користувача змінено');
            if (!process.env.IS_SERVER)
            {
                window.location.reload();
            }
        }
    }

    async makeMember()
    {
        await this.alterLevel(USER_LEVEL_MEMBER);
    }

    async makeModerator()
    {        
        await this.alterLevel(USER_LEVEL_MODERATOR);
    }

    async makeAdmin()
    {        
        await this.alterLevel(USER_LEVEL_ADMIN);
    }

    render()
    {
        var viewed = this.props.data.viewedUser;
        var now = new Date();
        return (
            <div className="container">
                <Helmet>
                    <title>{viewed.displayName}</title>
                </Helmet>
                <div className={s.topRow}>
                    <img className={s.userpic} src={viewed.photo || DEFAULT_USERPIC} />
                    <div className={s.userCard}>
                        <span className={s.displayName}>{viewed.displayName}</span>
                        {this.userRolePanel(viewed.role)}
                    </div>
                </div>
                {checkPrivilege(this.props.data.user, USER_LEVEL_ADMIN)
                && viewed._id !== this.props.data.user._id
                && viewed.role !== "owner" ? (
                    <div className={s.adminControls}>
                        {viewed.role !== 'member' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeMember.bind(this)}>Зробити учасником</BlueButton>
                        ) : null}
                        {viewed.role !== 'moderator' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeModerator.bind(this)}>Зробити модератором</BlueButton>
                        ) : null}
                        {viewed.role !== 'admin' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeAdmin.bind(this)}>Зробити адміністратором</BlueButton>
                        ) : null}
                    </div>
                ) : null}
                <div className={s.historyView}>
                    {this.props.data.history.map(item => (
                        <div key={item._id} className={s.historyItem}>
                            <span className={s.timestamp}>{this.userFriendlyTimestamp(new Date(item.Time), now)}</span>
                            <span className={s.action}>{this.localAction(item.Action)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(ViewProfile, s, '/api/getProfile/:id');

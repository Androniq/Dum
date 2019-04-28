import React from 'react';
import PropTypes from 'prop-types';
import s from './ViewChange.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal, checkPrivilege, USER_LEVEL_ADMIN, USER_LEVEL_MEMBER, USER_LEVEL_MODERATOR, showSticky } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class ViewChange extends React.Component
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

    async gotoUser()
    {
        window.open("/viewProfile/" + this.props.data.theUser._id, "_blank");
    }

    async gotoArticle()
    {
        window.open("/article/" + this.props.data.articleUrl, "_blank");
    }

    async gotoHistory()
    {
        window.open("/viewHistory/" + this.props.data.articleId, "_blank");
    }

    copyStringToClipboard(str)
    {
        // Create new element
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
     }

    async copyData()
    {
        var text = JSON.stringify(this.props.data.Change, null, 2);
        console.info(text);
        this.copyStringToClipboard(text);
        showSticky(this, "Зміни у форматі JSON скопійовано до буферу обміну");
    }

    render()
    {
        return (
            <div className="container">
                <Helmet>
                    <title>Перегляд зміни</title>
                </Helmet>
                <h3 className={s.header}>Хто?</h3>
                {this.props.data.theUser ? (
                <div className={s.topRow}>
                    <img className={s.userpic} src={this.props.data.theUser.photo || DEFAULT_USERPIC} />
                    <div className={s.userCard}>
                        <span className={s.displayName}>{this.props.data.theUser.displayName}</span>
                        {this.userRolePanel(this.props.data.theUser.role)}
                    </div>
                    <div className={s.rightContainer}>
                        <BlueButton className={s.viewUserButton} onClick={this.gotoUser.bind(this)}>Переглянути користувача</BlueButton>
                    </div>
                </div>
                ) : (
                <div className={s.topRow}>
                    <img className={s.userpic} src={DEFAULT_USERPIC} />
                    <div className={s.userCard}>
                        <span className={s.displayName}>Видалений користувач</span>
                    </div>
                </div>
                )}
                <h3 className={s.header}>Де?</h3>
                <div className={s.row}>
                    <span className={s.text}>Стаття «{this.props.data.articleName}»</span>                    
                    {this.props.data.articleExists ? (
                        <div className={s.rightContainer}>
                            <BlueButton className={s.viewUserButton} onClick={this.gotoArticle.bind(this)}>Переглянути статтю</BlueButton>
                        </div>
                    ) : (
                        <React.Fragment>
                            <span className={s.text}>Видалена {new Date(this.props.data.articleDeleted).toLocaleDateString('uk-UA')} {new Date(this.props.data.articleDeleted).toLocaleTimeString('uk-UA')}</span>
                            <div className={s.rightContainer}>
                                <BlueButton className={s.viewUserButton} onClick={this.gotoHistory.bind(this)}>Переглянути історію</BlueButton>
                            </div>
                        </React.Fragment>
                    )}
                </div>
                <h3 className={s.header}>Коли?</h3>
                <div className={s.topRow}>
                    <span>{new Date(this.props.data.Time).toLocaleDateString('uk-UA')} {new Date(this.props.data.Time).toLocaleTimeString('uk-UA')}</span>
                </div>
                <h3 className={s.header}>Що зробив?</h3>
                <div className={s.topRow}>
                    <span className={s.text}>{this.localAction(this.props.data.Action)}</span>
                    <div className={s.rightContainer}>
                        <BlueButton className={s.viewUserButton} onClick={this.copyData.bind(this)}>Скопіювати JSON змін</BlueButton>
                    </div>
                </div>
            </div>
        );
    }
}

export default withEverything(ViewChange, s, '/api/getChange/:id');

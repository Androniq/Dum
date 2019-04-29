import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';
import cx from 'classnames';
import Chart from 'react-chartjs-2';
import { UserContext } from '../../UserContext.js';
import Popup from "reactjs-popup";
import Collapsible from 'react-collapsible';
import PriorityHeader from '../../components/PriorityHeader/PriorityHeader';
import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER, 
    showSticky,
    totalRecall,
    emailRegex,
    DEFAULT_USERPIC,
    goToLink} from '../../utility';
import history from '../../history';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import { Link } from 'react-router-dom';
import withEverything from '../../withEverything';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';
import TextInput from '../../components/TextInput/TextInput';
import UploadImage from '../../components/UploadImage/UploadImage';
import UploadArchive from '../../components/UploadArchive/UploadArchive';

class Account extends React.Component
{
    static propTypes = {};

    state =
    {
        usernameOpen: false,
        emailOpen: false,
        passwordOpen: false,
        deleteUserpicOpen: false,
        uploadUserpicOpen: false,
        uploadBackupOpen: false
    };

    constructor(props)
    {
        super(props);
        var user = this.props.context.user;
        if (!user) return;
        this.state.username = user.displayName;
        this.state.email = user.email;
        this.state.password = user.password;
    }

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

  async resendConfirm()
  {
      var ans = await this.props.context.fetch('/api/startConfirm', { method: 'GET' });
      if (ans.status !== 200)
      {
          console.error(ans.status);
          return;
      }
      var json = await ans.json();
      if (!json.success)
      {
          console.error(json.message);
          return;
      }
      showSticky(this, "Лист із посиланням висланий на " + this.props.context.user.email);
  }

  async requestArticle()
  {      
  }

  updateUsername(value) { this.setState({ username: value }); }
  onUsernameOpen() { this.setState({ usernameOpen: true }); }
  onUsernameClose() { this.setState({ usernameOpen: false }); }

  updateEmail(value) { this.setState({ email: value }); }
  onEmailOpen() { this.setState({ emailOpen: true }); }
  onEmailClose() { this.setState({ emailOpen: false }); }

  updatePassword(value) { this.setState({ password: value }); }
  updatePasswordN1(value) { this.setState({ passwordN1: value }); }
  updatePasswordN2(value) { this.setState({ passwordN2: value }); }
  onPasswordOpen() { this.setState({ passwordOpen: true }); }
  onPasswordClose() { this.setState({ passwordOpen: false }); }

  onDeleteUserpicOpen() { this.setState({ deleteUserpicOpen: true }); }
  onDeleteUserpicClose() { this.setState({ deleteUserpicOpen: false }); }

  onUploadUserpicOpen() { this.setState({ uploadUserpicOpen: true }); }
  onUploadUserpicClose() { this.setState({ uploadUserpicOpen: false }); }
  
  onUploadBackupOpen() { this.setState({ uploadBackupOpen: true }); }
  onUploadBackupClose() { this.setState({ uploadBackupOpen: false }); }
  
    async saveUsername()
    {
        var username = this.state.username;
        if (!username || username.length < 1)
        {
            showSticky(this, 'Введіть ім’я!');
            return;
        }
        var resp = await this.props.context.fetch('/api/setMe', { method: 'POST', body: JSON.stringify({ 'displayName': username }) });
        var json = await resp.json();
        if (!json.success)
        {
            console.error(json.message);
            return;
        }
        this.props.context.user = json.user;
        this.onUsernameClose();
    }

    async saveEmail()
    {
        var email = this.state.email;
        if (!email || email.length < 1 || !emailRegex.test(email))
        {
            showSticky(this, 'Введіть правильну адресу електронної пошти!');
            return;
        }
        if (email === this.props.context.user.email)
        {
            showSticky(this, 'Це і є ваша поточна адреса електронної пошти!');
            return;
        }
        var resp = await this.props.context.fetch('/api/startConfirm?update=' + email, { method: 'GET' });
        var json = await resp.json();
        if (!json.success)
        {
            if (json.localMessage)
                showSticky(this, json.localMessage);
            else
                console.error(json.message);
            return;
        }
        showSticky(this, 'Адресу електронної пошти буде оновлено після отримання підтвердження');
        this.onEmailClose();
    }

    async savePassword()
    {
        var oldpwd = this.state.password;
        var newpwd = this.state.passwordN1;
        var user = this.props.context.user;
        if (user.password && user.password.length && (!oldpwd || !oldpwd.length))
        {
            showSticky(this, 'Введіть свій поточний пароль!');
            return;
        }
        if (newpwd !== this.state.passwordN2)
        {
            showSticky(this, 'Паролі не збігаються!');
            return;
        }
        var resp = await this.props.context.fetch('/api/setMe', { method: 'POST', body: JSON.stringify({ password: newpwd, oldPassword: oldpwd }) });
        var json = await resp.json();
        if (!json.success)
        {
            if (json.localMessage)
                showSticky(this, json.localMessage);
            else
                console.error(json.message);
            return;
        }
        showSticky(this, 'Пароль змінено');
        this.onPasswordClose();
    }

    async uploadPhoto()
    {

    }

    async removePhoto()
    {
        var resp = await this.props.context.fetch('/api/setMe', { method: 'POST', body: JSON.stringify({ 'photo': DEFAULT_USERPIC }) });
        var json = await resp.json();
        if (!json.success)
        {
            console.error(json.message);
            return;
        }
        this.props.context.user = json.user;
        this.onDeleteUserpicClose();
    }

    async gotoNotif()
    {
        goToLink(this, '/notifications');
    }

    async gotoEventLog()
    {
        goToLink(this, '/eventLog');
    }

    async gotoEditBlog()
    {
        goToLink(this, '/editBlog');
    }

    async gotoApprovals()
    {
        goToLink(this, '/approvals');
    }

    async gotoUserList()
    {
        goToLink(this, '/userList');
    }

    constructArray(buffer)
    {
        if (!buffer || !buffer.length)
            return [];
        var length = 0;
        buffer.forEach(it => length += it.length);
        var r = new buffer[0].constructor(length);
        var index = 0;
        buffer.forEach(it =>
            {
                r.set(it, index);
                index += it.length;
            })
        return r;
    }
        
    async getBackup()
    {
        var fileDownload = require('js-file-download');
        var resp = await this.props.context.fetch('/api/getBackup', { method: 'GET' });
        var reader = resp.body.getReader();
        var buffer = [];
        var data;

        do
        {
            data = await reader.read();
            if (data.value)
                buffer.push(data.value);
        }
        while (data && !data.done)

        console.info(buffer.length);
        fileDownload(this.constructArray(buffer), 'backup.zip', 'application/zip');
    }

    async rollBackup()
    {
    }

    render()
    {
        var user = this.props.context.user;
        if (!user) // not an error - could click Logout while staying on this page
            return <Redirect to='/' />;
    
        var hasAvatar = user.photo && user.photo !== DEFAULT_USERPIC;

        var role = user.confirmed ? user.role : 'visitor';

        var innerRow1 = cx(s.innerRow1, this.props.context.isMobile ? s.innerRowMobile : null);
        var innerRow2 = cx(s.innerRow2, this.props.context.isMobile ? s.innerRowMobile : null);
        var innerRow3 = cx(s.innerRow3, this.props.context.isMobile ? s.innerRowMobile : null);
        var inputField = this.props.context.isMobile ? s.inputFieldMobile : s.inputField;
        var ynButton = this.props.context.isMobile ? s.ynButtonMobile : s.ynButton;

        return (
        <div className={s.container}>
            <Helmet>
                <title>{user.displayName}</title>
            </Helmet>
            <div className={s.topRow}>
                <img className={s.userpic} src={user.photo || DEFAULT_USERPIC} />
                <div className={s.userCard}>
                    <span className={s.displayName}>{user.displayName}</span>
                    {this.userRolePanel(role)}
                </div>
                {!user.confirmed?(
                <div className={s.column}>
                    <span className={s.columnItem}>Вам потрібно підтвердити свою адресу електронної пошти. Лист із посиланням був висланий на адресу {user.email} (перевірте теку «Спам»).</span>
                    <BlueButton className={s.columnItemBtn} onClick={this.resendConfirm.bind(this)}>Вислати знову</BlueButton>
                    <div className={s.columnItem} />
                </div>
                ):(
                <div className={cx(s.grid, s.right)}>
                    <span className={cx(s.row1, s.column1)}>Ваш email:</span>
                    <span className={cx(s.row1, s.column2)}>{user.email}</span>
                    <Popup modal open={this.state.emailOpen} onOpen={this.onEmailOpen.bind(this)} onClosed={this.onEmailClose.bind(this)}
                        trigger={(
                            <BlueButton className={cx(s.row1, s.column3)}>Змінити</BlueButton>
                    )}>
                        <div className={s.grid}>
                            <div className={cx(s.flex, innerRow1)}>
                                <span className={s.label}>Введіть адресу електронної пошти:</span>
                                <TextInput noPopup className={inputField} value={this.props.context.user.email}
                                    onSave={this.updateEmail.bind(this)} />
                            </div>
                            <div className={cx(s.flex, innerRow2)}>
                                <BlueButton className={ynButton} onClick={this.saveEmail.bind(this)}>Гаразд</BlueButton>
                                <BlueButton className={ynButton} onClick={this.onEmailClose.bind(this)}>Скасувати</BlueButton>
                            </div>
                        </div>
                    </Popup>                    
                    <span className={cx(s.row2, s.column1)}>Ваше ім’я:</span>
                    <span className={cx(s.row2, s.column2)}>{user.displayName}</span>
                    <Popup modal open={this.state.usernameOpen} onOpen={this.onUsernameOpen.bind(this)} onClosed={this.onUsernameClose.bind(this)}
                        trigger={(
                        <BlueButton className={cx(s.row2, s.column3)}>Змінити</BlueButton>
                    )}>
                        <div className={s.grid}>
                            <div className={cx(s.flex, innerRow1)}>
                                <span className={s.label}>Введіть ім’я для відображення:</span>
                                <TextInput noPopup className={inputField} value={this.props.context.user.displayName}
                                    onSave={this.updateUsername.bind(this)} />
                            </div>
                            <div className={cx(s.flex, innerRow2)}>
                                <BlueButton className={ynButton} onClick={this.saveUsername.bind(this)}>Гаразд</BlueButton>
                                <BlueButton className={ynButton} onClick={this.onUsernameClose.bind(this)}>Скасувати</BlueButton>
                            </div>
                        </div>
                    </Popup>
                    <span className={cx(s.row3, s.column1)}>Безпека:</span>
                    <Popup modal open={this.state.passwordOpen} onOpen={this.onPasswordOpen.bind(this)} onClosed={this.onPasswordClose.bind(this)}
                        trigger={(
                            <BlueButton className={cx(s.row3, s.column23)}>Змінити пароль</BlueButton>
                        )}>
                        <div className={s.grid}>
                            <div className={cx(s.grid, innerRow1)}>
                                {user.password && user.password.length ? (
                                    <React.Fragment>
                                        <span className={cx(s.label, s.innerRow1, s.column1)}>Поточний пароль:</span>
                                        <TextInput noPopup className={cx(inputField, s.innerRow1, s.column2)} type="password"
                                            onSave={this.updatePassword.bind(this)} />
                                    </React.Fragment>
                                ) : null}
                                <span className={cx(s.label, innerRow2, s.column1)}>Новий пароль:</span>
                                <TextInput noPopup className={cx(inputField, s.innerRow2, s.column2)} type="password"
                                    onSave={this.updatePasswordN1.bind(this)} />
                                <span className={cx(s.label, innerRow3, s.column1)}>Повторіть новий пароль:</span>
                                <TextInput noPopup className={cx(inputField, s.innerRow3, s.column2)} type="password"
                                    onSave={this.updatePasswordN2.bind(this)} />
                            </div>
                            <div className={cx(s.flex, s.innerRow2)}>
                                <BlueButton className={ynButton} onClick={this.savePassword.bind(this)}>Гаразд</BlueButton>
                                <BlueButton className={ynButton} onClick={this.onPasswordClose.bind(this)}>Скасувати</BlueButton>
                            </div>
                        </div>
                    </Popup>
                    <span className={cx(s.row4, s.column1)}>Світлина:</span>
                    {hasAvatar?(
                        <React.Fragment>
                            <Popup modal open={this.state.uploadUserpicOpen} onOpen={this.onUploadUserpicOpen.bind(this)}
                                onClosed={this.onUploadUserpicClose.bind(this)} trigger={(
                                    <BlueButton className={cx(s.row4, s.column2)} onClick={this.requestArticle.bind(this)}>Змінити</BlueButton>
                                )}>
                                <UploadImage {...this.props} onSuccess={this.onUploadUserpicClose.bind(this)} />
                            </Popup>
                            <Popup modal open={this.state.deleteUserpicOpen} onOpen={this.onDeleteUserpicOpen.bind(this)}
                                onClosed={this.onDeleteUserpicClose.bind(this)} trigger={(
                                <BlueButton className={cx(s.row4, s.column3)} onClick={this.requestArticle.bind(this)}>Видалити</BlueButton>
                            )}>
                                <div className={s.grid}>
                                    <div className={s.innerRow1}>
                                        <span className={s.label}>Видалити світлину профілю?</span>
                                    </div>
                                    <div className={cx(s.flex, s.innerRow2)}>
                                        <BlueButton onClick={this.removePhoto.bind(this)}>Так, видалити</BlueButton>
                                        <BlueButton onClick={this.onDeleteUserpicClose.bind(this)}>Ні, не треба</BlueButton>
                                    </div>
                                </div>
                            </Popup>
                        </React.Fragment>
                    ):(
                        <React.Fragment>
                            <Popup modal open={this.state.uploadUserpicOpen} onOpen={this.onUploadUserpicOpen.bind(this)}
                                onClosed={this.onUploadUserpicClose.bind(this)} trigger={(
                                    <BlueButton className={cx(s.row4, s.column23)} onClick={this.requestArticle.bind(this)}>Завантажити</BlueButton>
                                )}>
                                <UploadImage {...this.props} onSuccess={this.onUploadUserpicClose.bind(this)} />
                            </Popup>
                        </React.Fragment>
                    )}
                </div>
                )}
            </div>
            <div className={s.linkedAccounts}>
                <div className={s.linkedGoogle}>
                </div>
                <div className={s.linkedFb}>
                </div>
            </div>
            <div className={s.navButtons}>
                {checkPrivilege(user, USER_LEVEL_MEMBER) ? (
                    <BlueButton className={s.navButton} onClick={this.gotoNotif.bind(this)} redDot={this.props.data.unreadNotifCount}>
                        Сповіщення
                    </BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_MODERATOR) ? (
                    <BlueButton className={s.navButton} onClick={this.gotoApprovals.bind(this)}>Переглянути пропозиції</BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_ADMIN) ? (
                    <BlueButton className={s.navButton} onClick={this.gotoUserList.bind(this)}>Список користувачів</BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_ADMIN) ? (
                    <BlueButton className={s.navButton} onClick={this.gotoEditBlog.bind(this)}>Написати в блоґ</BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_OWNER) ? (
                    <BlueButton className={s.navButton} onClick={this.gotoEventLog.bind(this)}>Журнал подій</BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_OWNER) ? (
                    <BlueButton className={s.navButton} onClick={this.getBackup.bind(this)}>Бекап</BlueButton>
                ):null}
                {checkPrivilege(user, USER_LEVEL_OWNER) ? (
                    <Popup modal open={this.state.uploadBackupOpen} onOpen={this.onUploadBackupOpen.bind(this)}
                        onClosed={this.onUploadBackupClose.bind(this)} trigger={(
                            <BlueButton className={s.navButton} onClick={this.rollBackup.bind(this)}>Відновити з бекапу</BlueButton>
                                )}>
                        <UploadArchive {...this.props} onSuccess={this.onUploadBackupClose.bind(this)} />
                    </Popup>
                ):null}
                {checkPrivilege(user, USER_LEVEL_OWNER) ? (
                    <BlueButton className={s.navButton}>Передати сайт</BlueButton>
                ):null}
            </div>
        </div>
      );
  }
}

export default withEverything(Account, s, '/api/getAccount');
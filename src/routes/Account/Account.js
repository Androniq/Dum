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
    emailRegex} from '../../utility';
import history from '../../history';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import { Link } from 'react-router-dom';
import withEverything from '../../withEverything';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';
import TextInput from '../../components/TextInput/TextInput';
import UploadImage from '../../components/UploadImage/UploadImage';

class Account extends React.Component
{
  static propTypes = {};

  state = {
      usernameOpen: false,
      emailOpen: false,
      passwordOpen: false,
      deleteUserpicOpen: false,
      uploadUserpicOpen: false
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
        var resp = await this.props.context.fetch('/api/setMe', { method: 'POST', body: JSON.stringify({ 'photo': "/images/no_image_available.png" }) });
        var json = await resp.json();
        if (!json.success)
        {
            console.error(json.message);
            return;
        }
        this.props.context.user = json.user;
        this.onDeleteUserpicClose();
    }

  render()
  {
    var user = this.props.context.user;
    if (!user) // not an error - could click Logout while staying on this page
        return <Redirect to='/' />;
    
    var hasAvatar = user.photo && user.photo !==  "/images/no_image_available.png";

    var role = user.confirmed ? user.role : 'visitor';
    return (
        <div className={s.container}>
            <Helmet>
                <title>{user.displayName}</title>
            </Helmet>
            <div className={s.topRow}>
                <img className={s.userpic} src={user.photo || "/images/no_image_available.png"} />
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
                            <div className={cx(s.flex, s.innerRow1)}>
                                <span className={s.label}>Введіть адресу електронної пошти:</span>
                                <TextInput noPopup className={s.inputField} value={this.props.context.user.email}
                                    onSave={this.updateEmail.bind(this)} />
                            </div>
                            <div className={cx(s.flex, s.innerRow2)}>
                                <BlueButton onClick={this.saveEmail.bind(this)}>Гаразд</BlueButton>
                                <BlueButton onClick={this.onEmailClose.bind(this)}>Скасувати</BlueButton>
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
                            <div className={cx(s.flex, s.innerRow1)}>
                                <span className={s.label}>Введіть ім’я для відображення:</span>
                                <TextInput noPopup className={s.inputField} value={this.props.context.user.displayName}
                                    onSave={this.updateUsername.bind(this)} />
                            </div>
                            <div className={cx(s.flex, s.innerRow2)}>
                                <BlueButton onClick={this.saveUsername.bind(this)}>Гаразд</BlueButton>
                                <BlueButton onClick={this.onUsernameClose.bind(this)}>Скасувати</BlueButton>
                            </div>
                        </div>
                    </Popup>
                    <span className={cx(s.row3, s.column1)}>Безпека:</span>
                    <Popup modal open={this.state.passwordOpen} onOpen={this.onPasswordOpen.bind(this)} onClosed={this.onPasswordClose.bind(this)}
                        trigger={(
                            <BlueButton className={cx(s.row3, s.column23)}>Змінити пароль</BlueButton>
                        )}>
                        <div className={s.grid}>
                            <div className={cx(s.grid, s.innerRow1)}>
                                {user.password && user.password.length ? (
                                    <React.Fragment>
                                        <span className={cx(s.label, s.innerRow1, s.column1)}>Поточний пароль:</span>
                                        <TextInput noPopup className={cx(s.inputField, s.innerRow1, s.column2)} type="password"
                                            onSave={this.updatePassword.bind(this)} />
                                    </React.Fragment>
                                ) : null}
                                <span className={cx(s.label, s.innerRow2, s.column1)}>Новий пароль:</span>
                                <TextInput noPopup className={cx(s.inputField, s.innerRow2, s.column2)} type="password"
                                    onSave={this.updatePasswordN1.bind(this)} />
                                <span className={cx(s.label, s.innerRow3, s.column1)}>Повторіть новий пароль:</span>
                                <TextInput noPopup className={cx(s.inputField, s.innerRow3, s.column2)} type="password"
                                    onSave={this.updatePasswordN2.bind(this)} />
                            </div>
                            <div className={cx(s.flex, s.innerRow2)}>
                                <BlueButton onClick={this.savePassword.bind(this)}>Гаразд</BlueButton>
                                <BlueButton onClick={this.onPasswordClose.bind(this)}>Скасувати</BlueButton>
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
        </div>
      );
  }
}

export default withEverything(Account, s);
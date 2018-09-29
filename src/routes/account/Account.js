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

class Account extends React.Component
{
  static propTypes = {};

  state = {
      usernameOpen: false,
      emailOpen: false
  };

  constructor(props)
  {
    super(props);
    var user = this.props.context.user;
    if (!user) return;
    this.state.username = user.displayName;
    this.state.email = user.email;
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

  render()
  {
    var user = this.props.context.user;
    if (!user) // not an error - could click Logout while staying on this page
        return <Redirect to='/' />;

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
                        <BlueButton className={cx(s.row2, s.column3)} onClick={this.requestArticle.bind(this)}>Змінити</BlueButton>
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
                    <BlueButton className={cx(s.row3, s.column23)} onClick={this.requestArticle.bind(this)}>Змінити пароль</BlueButton>
                    <span className={cx(s.row4, s.column1)}>Світлина:</span>
                    <BlueButton className={cx(s.row4, s.column2)} onClick={this.requestArticle.bind(this)}>Змінити</BlueButton>
                    <BlueButton className={cx(s.row4, s.column3)} onClick={this.requestArticle.bind(this)}>Видалити</BlueButton>
                </div>
                )}
            </div>
        </div>
      );
  }
}

export default withEverything(Account, s);
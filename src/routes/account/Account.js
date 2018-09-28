import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Account.css';
import classnames from 'classnames';
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
    showSticky} from '../../utility';
import history from '../../history';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import { Link } from 'react-router-dom';
import StickyMessage from '../../components/StickyMessage/StickyMessage';
import withEverything from '../../withEverything';
import { Helmet } from 'react-helmet';

class Account extends React.Component
{
  static propTypes = {};

  state = {};

  constructor(props)
  {
    super(props);
  }

  userRolePanel(confirmed, role)
  {
      if (!confirmed)
      {
          return (
            <span>Гість</span>
          );
      }
    switch (role)
    {
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

  render()
  {
      var user = this.props.context.user;
      return (
        <div className={s.container}>
            <Helmet>
                <title>{user.displayName}</title>
            </Helmet>
            <img className={s.userpic} src={user.photo} />
            <div className={s.userCard}>
            <span className={s.displayName}>{user.displayName}</span>
            {this.userRolePanel(user.confirmed, user.role)}
            </div>
        </div>
      );
  }
}

export default withEverything(Account, s);
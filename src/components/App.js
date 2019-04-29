import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router';
import { Helmet } from 'react-helmet';

import Home from '../routes/Home/Home';
import Article from '../routes/Article/Article';
import Blog from '../routes/Blog/Blog';
import Login from '../routes/Login/Login';
import EditArticle from '../routes/EditArticle/EditArticle';
import EditArgument from '../routes/EditArgument/EditArgument';
import Account from '../routes/Account/Account';
import Confirm from '../routes/Confirm/Confirm';
import Loading, { LoadingWithEverything } from './Loading/Loading';
import ErrorPage, { ErrorPageWithEverything } from '../routes/Error/ErrorPage';
import Notifications from '../routes/Notifications/Notifications';
import EditBlog from '../routes/EditBlog/EditBlog';
import EventLog from '../routes/EventLog/EventLog';
import UserList from '../routes/UserList/UserList';
import Approvals from '../routes/Approvals/Approvals';
import EditCounterArgument from '../routes/EditCounterArgument/EditCounterArgument';
import ViewProfile from '../routes/ViewProfile/ViewProfile';
import ViewChange from '../routes/ViewChange/ViewChange';
import ViewHistory from '../routes/ViewHistory/ViewHistory';
import ProposeArticle from '../routes/ProposeArticle/ProposeArticle';
import { MobileView, BrowserView, getUA } from 'react-device-detect';

const ContextType =
{
  // Enables critical path CSS rendering
  // https://github.com/kriasoft/isomorphic-style-loader
  insertCss: PropTypes.func.isRequired,
  // Universal HTTP client
  fetch: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  query: PropTypes.object,
  user: PropTypes.object,
  location: PropTypes.object,
  history: PropTypes.object,
  data: PropTypes.object,
  rehydrateState: PropTypes.object,
  setLayoutState: PropTypes.func,
  action: PropTypes.func,
  url: PropTypes.string,
  isMobile: PropTypes.bool
};

class App extends React.Component
{
  static propTypes =
  {
    context: PropTypes.shape(ContextType).isRequired
  };

  static childContextTypes = ContextType;

  getChildContext()
  {
    return this.props.context;
  }

  render()
  {
    var context = this.props.context;
    context.isMobile = getUA.indexOf("Mobile") != -1;
    return (
      <React.Fragment>
        <Switch>
          <Route path='/' exact render={Home(context)} />
          <Route path='/article/:id' render={Article(context)} />
          <Route path='/blog/:id' render={Blog(context)} />
          <Route path='/login' render={Login(context)} />
          <Route path='/editArticle/:id' render={EditArticle(context)} />
          <Route path='/editArgument/:argId/:articleId' render={EditArgument(context)} />
          <Route path='/editArgument/:argId' render={EditArgument(context)} />
          <Route path='/editCounterArgument/:argId/:idChain' render={EditCounterArgument(context)} />
          <Route path='/account' render={Account(context)} />
          <Route path='/confirm/:token' render={Confirm(context)} />
          <Route path='/notifications' render={Notifications(context)} />
          <Route path='/approvals' render={Approvals(context)} />
          <Route path='/proposeArticle' render={ProposeArticle(context)} />
          <Route path='/editBlog' render={EditBlog(context)} />
          <Route path='/eventLog' render={EventLog(context)} />
          <Route path='/userList' render={UserList(context)} />
          <Route path='/viewProfile/:id' render={ViewProfile(context)} />
          <Route path='/viewChange/:id' render={ViewChange(context)} />
          <Route path='/viewHistory/:id' render={ViewHistory(context)} />
          <Route path='/loading' render={LoadingWithEverything(context)} />
          <Route render={ErrorPageWithEverything(context)} />
        </Switch>
        <Helmet titleTemplate="%s | ДУМ" />
      </React.Fragment>
    );
  }
}

export default App;

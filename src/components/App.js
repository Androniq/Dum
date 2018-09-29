import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router';
import { Helmet } from 'react-helmet';

import Home from '../routes/home/Home';
import Article from '../routes/article/Article';
import Blog from '../routes/blog/Blog';
import Login from '../routes/login/Login';
import ErrorPage, { ErrorPageWithEverything } from '../routes/error/ErrorPage';
import EditArticle from '../routes/editArticle/EditArticle';
import EditArgument from '../routes/editArgument/EditArgument';
import Account from '../routes/account/Account';
import Loading, { LoadingWithEverything } from './Loading/Loading';
import Confirm from '../routes/Confirm/Confirm';

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
  url: PropTypes.string
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
          <Route path='/account' render={Account(context)} />
          <Route path='/confirm/:token' render={Confirm(context)} />
          <Route path='/loading' render={LoadingWithEverything(context)} />
          <Route render={ErrorPageWithEverything(context)} />
        </Switch>
        <Helmet titleTemplate="%s | ДУМ" />
      </React.Fragment>
    );
  }
}

export default App;

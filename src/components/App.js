/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Layout from './Layout/Layout';
import { Switch, Route } from 'react-router';
import Home from '../routes/home/Home';
import Article from '../routes/article/Article';
import Blog from '../routes/blog/Blog';
import Login from '../routes/login/Login';
import ErrorPage from '../routes/error/ErrorPage';
import { Helmet } from 'react-helmet';
import EditArticle from '../routes/editArticle/EditArticle';
import EditArgument from '../routes/editArgument/EditArgument';

const ContextType = {
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
  rehydrateState: PropTypes.object
};

/**
 * The top-level React component setting context (global) variables
 * that can be accessed from all the child components.
 *
 * https://facebook.github.io/react/docs/context.html
 *
 * Usage example:
 *
 *   const context = {
 *     history: createBrowserHistory(),
 *     store: createStore(),
 *   };
 *
 *   ReactDOM.render(
 *     <App context={context}>
 *       <Layout>
 *         <LandingPage />
 *       </Layout>
 *     </App>,
 *     container,
 *   );
 */
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
          <Route component={ErrorPage} />
        </Switch>
        <Helmet titleTemplate="%s | ДУМ" />
      </React.Fragment>
    );
  }
}

export default App;

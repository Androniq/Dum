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
import ErrorPage from '../routes/error/ErrorPage';

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
class App extends React.PureComponent {
  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  render()
  {
    var context = this.props.context;
    return (      
      <Layout>
        <Switch>
          <Route path='/' exact render={Home(context)} />
          <Route path='/article/:id' render={Article(context)} />
          <Route component={ErrorPage} />
        </Switch>
      </Layout>
    );
  }
}

export default App;

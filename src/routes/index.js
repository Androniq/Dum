/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable global-require */

// The top-level (parent) route
const routes = {
  path: '',

  // Keep in mind, routes are evaluated in order
  children: [
    {
      path: '',
      load: () => import(/* webpackChunkName: 'home' */ './home'),
    },
    {
      path: '/contact',
      load: () => import(/* webpackChunkName: 'contact' */ './contact'),
    },
    {
      path: '/login',
      load: () => import(/* webpackChunkName: 'login' */ './login'),
    },
    {
      path: '/register',
      load: () => import(/* webpackChunkName: 'register' */ './register'),
    },
    {
      path: '/about',
      load: () => import(/* webpackChunkName: 'about' */ './about'),
    },
    {
      path: '/privacy',
      load: () => import(/* webpackChunkName: 'privacy' */ './privacy'),
    },
    {
      path: '/admin',
      load: () => import(/* webpackChunkName: 'admin' */ './admin'),
    },

    {
      name: "Account",
      path: '/account',
      load: () => import(/* webpackChunkName: 'account' */ './account'),
    },
    {
      name: "Article",
      path: '/article/(.*)',
      load: () => import(/* webpackChunkName: 'article' */ './article'),
    },
    {
      name: "EditArticle",
      path: '/editArticle/(.*)',
      load: () => import(/* webpackChunkName: 'editArticle' */ './editArticle'),
    },
    {
      name: "EditArgument",
      path: '/editArgument/(.*)/(.*)',
      load: () => import(/* webpackChunkName: 'editArgument' */ './editArgument'),
    },
    {
      name: "EditArgument",
      path: '/editArgument/(.*)',
      load: () => import(/* webpackChunkName: 'editArgument' */ './editArgument'),
    },
    {
      name: "Blog",
      path: '/blog/(.*)',
      load: () => import(/* webpackChunkName: 'blog' */ './blog'),
    },

    // Wildcard routes, e.g. { path: '(.*)', ... } (must go last)
    {
      path: '(.*)',
      load: () => import(/* webpackChunkName: 'not-found' */ './not-found'),
    },
  ],

  async action({ next }) {
    // Execute each child route until one of them return the result
    const route = await next();

    // Provide default values for title, description etc.
    route.title = `${route.title || 'Untitled Page'} | ДУМ`;
    route.description = route.description || '';

    return route;
  },
};

// The error page is available by permanent url for development mode
if (__DEV__) {
  routes.children.unshift({
    path: '/error',
    action: require('./error').default,
  });
}

export default routes;

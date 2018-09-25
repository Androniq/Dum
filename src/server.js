/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import { graphql } from 'graphql';
import expressGraphQL from 'express-graphql';
import jwt from 'jsonwebtoken';
import nodeFetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import createFetch from './createFetch';
import passport from './passport';
import router from './router';
import models from './data/models';
import schema from './data/schema';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import config from './config';
import session from 'express-session';
//import MongoDBStore from 'connect-mongodb-session';
import sendPopularVote from './serverLogic/sendPopularVote';
import { serverReady } from './serverLogic/_common';
import { findOrCreateUser, setUserRole, transferOwnership } from './serverLogic/auth';
import getArticle from './serverLogic/getArticle';
import getArticleInfo from './serverLogic/getArticleInfo';
import getArticles from './serverLogic/getArticles';
import setArticle from './serverLogic/setArticle';
import { getBlogByUrl } from './serverLogic/blog';
import { UserContext } from './UserContext.js';
import { getArgument, getNewArgument } from './serverLogic/getArgument';
import setArgument from './serverLogic/setArgument';
import checkArticleUrl from './serverLogic/checkArticleUrl';
import deleteArgument from './serverLogic/deleteArgument';
import deleteArticle from './serverLogic/deleteArticle';
import getAccount from './serverLogic/getAccount';
import assert from 'assert';

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  // send entire app down. Process manager will restart it
  process.exit(1);
});

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

const app = express();

//
// If you are using proxy from external machine, you can set TRUST_PROXY env
// Default is to trust proxy headers only from loopback interface.
// -----------------------------------------------------------------------------
app.set('trust proxy', config.trustProxy);

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// MongoDBStore

var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DBNAME,
  collection: 'Sessions'
}, function(error)
{
  if (error)
  {
    console.error(error);
  }  
});

function getUser(req) // this is Mongo-specific user getter (common one is simply req.user), so it is in MongoDBStore section
{
  if (req && req.user)
  {
    return req.user;
  }
  if (req && req.session && req.session.passport)
  {
    return req.session.passport.user;
  }
  return null;
}

store.on('connected', function() {
  store.client; // The underlying MongoClient object from the MongoDB driver
});
 
// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

app.use(
  session({
    secret: 'anythingadwdfewg rwgfer',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
    store: store
  }),
);

//
// Authentication
// -----------------------------------------------------------------------------
app.use(
  expressJwt({
    secret: config.auth.jwt.secret,
    credentialsRequired: false,
    getToken: req => req.cookies.id_token,
  }),
);
// Error handler for express-jwt
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie('id_token');
  }
  next(err);
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://mydomain.example.com:3000/login/google/callback',
      passReqToCallback: false,
    },
    (accessToken, refreshToken, profile, done) => {
      if (!profile) {
        // if we are here, it means that passReqToCallback is set to true
        // idk what to do here ^^
        return;
      }
      findOrCreateUser(profile.id, 'google', profile).then(
        user => done(null, user),
        err => done(err, null),
      );
    },
  ),
);

app.get(
  '/login/google',
  (req, res, next) =>
  {
    req.session.returnTo = req.query.returnTo;
    next();
  },
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email'],
    session: true,
    authInfo: true,
  }),
);

app.get(
  '/login/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect(req.session.returnTo || '/');
    req.session.returnTo = null;
  },
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: 'http://mydomain.example.com:3000/auth/facebook/callback',
      passReqToCallback: false
    },
    (accessToken, refreshToken, profile, done) => {
      if (!profile) {
        // if we are here, it means that passReqToCallback is set to true
        // idk what to do here ^^
        return;
      }
      findOrCreateUser(profile.id, 'facebook', profile).then(
        user => done(null, user),
        err => done(err, null));
    },
  ),
);

app.get(
  '/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'user_location'],
    session: true,
  }),
);
app.get(
  '/login/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect('/');
  },
);

app.get('/logout',
  (req, res) =>
  {
      req.session.passport = null;
      res.redirect(req.query.returnTo || '/');
  }  
)

// API

app.get('/api/whoami', async (req, res) => {
  res.send({ user: getUser(req) });
});

app.get('/api/getArticles', async (req, res) => {
  await serverReady();
  const data = await getArticles(getUser(req));
  res.send({ data });
});

app.get('/api/article/:code', async (req, res) => {
  await serverReady();
  const articleData = await getArticleInfo(req.params.code, getUser(req));
  res.send({ articleData });
});

app.get('/api/getArticle/:code', async (req, res) => {
  await serverReady();
  const article = await getArticle(req.params.code, getUser(req));
  res.send(article);
});

app.post('/api/setArticle', async (req, res) => {
  await serverReady();
  var resp = await setArticle(getUser(req), req.body);
  res.send(resp);
});

app.get('/api/getNewArgument/:id', async (req, res) => {
  await serverReady();
  const argument = await getNewArgument(getUser(req), req.params.id);
  res.send(argument);
});

app.get('/api/getArgument/:id', async (req, res) => {
  await serverReady();
  const argument = await getArgument(getUser(req), req.params.id);
  res.send(argument);
});

app.post('/api/setArgument', async (req, res) => {
  await serverReady();
  var resp = await setArgument(getUser(req), req.body);
  res.send(resp);
});

app.delete('/api/deleteArgument/:id', async (req, res) => {
  await serverReady();
  var resp = await deleteArgument(getUser(req), req.params.id);
  res.send(resp);
});

app.delete('/api/deleteArticle/:id', async (req, res) => {
  await serverReady();
  var resp = await deleteArticle(getUser(req), req.params.id);
  res.send(resp);
});

app.get('/api/checkArticleUrl/:id/:url', async (req, res) => {
  await serverReady();
  const result = await checkArticleUrl(req.params.url, req.params.id);
  res.send(result);
});

app.get('/api/sendPopularVote/:articleId/:voteId', async (req, res) => {
  await serverReady();
  const result = await sendPopularVote(getUser(req), req.params.articleId, req.params.voteId);
  res.send(result);
});

app.get('/api/getAccount', async (req, res) => {
  await serverReady();
  const result = await getAccount(getUser(req));
  res.send(result);

})

app.get('/api/getBlog/:blogUrl', async (req, res) => {
  await serverReady();
  const result = await getBlogByUrl(req.params.blogUrl);
  res.send(result);
});

app.get('/api/setUserRole/:userId/:role', async (req, res) => {
  await serverReady();
  const resp = await setUserRole(getUser(req), req.params.userId, req.params.role);
  res.send(resp);
});

app.get('/api/transferOwnership/:userId', async (req, res) => {
  await serverReady();
  const resp = await transferOwnership(getUser(req), req.params.userId);
  res.send(resp);
});


//
// Register API middleware
// -----------------------------------------------------------------------------
app.use(
  '/graphql',
  expressGraphQL(req => ({
    schema,
    graphiql: __DEV__,
    rootValue: { request: req },
    pretty: __DEV__,
  })),
);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Enables critical path CSS rendering
    // https://github.com/kriasoft/isomorphic-style-loader
    const insertCss = (...styles) => {
      // eslint-disable-next-line no-underscore-dangle
      styles.forEach(style => css.add(style._getCss()));
    };

    // Universal HTTP client
    const fetch = createFetch(nodeFetch, {
      baseUrl: config.api.serverUrl,
      cookie: req.headers.cookie,
      schema,
      graphql,
    });

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      insertCss,
      fetch,
      user: getUser(req),
      // The twins below are wild, be careful!
      pathname: req.path,
      query: req.query,
    };
    
    const route = await router.resolve(context);

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    context.location = { state: { returnTo: req.session.ssrLastUrl || "/" }};
    if (req.path != "/json") { req.session.ssrLastUrl = req.path; }
    const data = { ...route };
    data.children = ReactDOM.renderToString(
      <UserContext.Provider value={context}><App context={context}>{route.component}</App></UserContext.Provider>,
    );
    data.styles = [{ id: 'css', cssText: [...css].join('') }];

    const scripts = new Set();
    const addChunk = chunk => {
      if (chunks[chunk]) {
        chunks[chunk].forEach(asset => scripts.add(asset));
      } else if (__DEV__) {
        console.error(`Chunk with name '${chunk}' cannot be found`);
      }
    };
    addChunk('client');
    if (route.chunk) addChunk(route.chunk);
    if (route.chunks) route.chunks.forEach(addChunk);

    data.scripts = Array.from(scripts);
    data.app = {
      apiUrl: config.api.clientUrl,
    };

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      styles={[{ id: 'css', cssText: errorPageStyle._getCss() }]} // eslint-disable-line no-underscore-dangle
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
const promise = models.sync().catch(err => console.error(err.stack));
if (!module.hot) {
  promise.then(() => {
    app.listen(config.port, () => {
      console.info(`The server is running at http://localhost:${config.port}/`);
    });
  });
}

//
// Hot Module Replacement
// -----------------------------------------------------------------------------
if (module.hot) {
  app.hot = module.hot;
  module.hot.accept('./router');
}

export default app;

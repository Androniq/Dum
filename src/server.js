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
import jwt from 'jsonwebtoken';
import nodeFetch from 'node-fetch';
import React from 'react';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/Error/ErrorPage';
import errorPageStyle from './routes/Error/ErrorPage.css';
import createFetch from './createFetch';
import passport from './passport';
import { emailRegex } from './utility';
import models from './data/models';
import schema from './data/schema';
// import assets from './asset-manifest.json'; // eslint-disable-line import/no-unresolved
import chunks from './chunk-manifest.json'; // eslint-disable-line import/no-unresolved
import config from './config';
import session from 'express-session';
import sendPopularVote from './serverLogic/sendPopularVote';
import { serverReady } from './serverLogic/_common';
import { findOrCreateUser, setUserRole, transferOwnership, findLocalUser, startConfirm, endConfirm } from './serverLogic/auth';
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
import FB from 'fb';
import { StaticRouter } from 'react-router';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import asyncBootstrapper from 'react-async-bootstrapper';
import serialize from 'serialize-javascript';
import { Helmet } from 'react-helmet';
import { setMe, getUserList } from './serverLogic/users';
import { mongoAsync } from './serverStartup';
import { upload } from './serverLogic/upload';
import mongodb from 'mongodb';
import getNotifications from './serverLogic/getNotifications';
import getApprovals from './serverLogic/getApprovals';

process.env.IS_SERVER=true;

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
app.use(bodyParser.raw(
  {
    inflate: true,
    limit: '100kb',
    type: 'image/*'
}));
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

function setUser(req, newValue)
{
  if (!req)
    return;
  if (req.user)
  {
    req.user = newValue;
  }
  if (req.session && req.session.passport)
  {
    req.session.passport.user = newValue;
  }
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
const LocalStrategy = require('passport-local').Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.SITE_URL + 'login/google/callback',
      passReqToCallback: false,
    },
    (accessToken, refreshToken, profile, done) => {
      if (profile.photos)
      {
        var photo = null;
        profile.photos.forEach(it =>
          {
            if (it && it.value)
              photo = it.value;
          });
        profile.photo = photo;
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
      callbackURL: process.env.SITE_URL + 'login/facebook/callback',
      passReqToCallback: false
    },
    (accessToken, refreshToken, profile, done) => {
      FB.api('/' + profile.id, 'GET', { fields: 'email,picture.width(150).height(150)', access_token: accessToken }, function(response)
      {
        var picture = response.picture.data.url;
        var email = response.email;
        profile.email = email;
        profile.photo = picture;
        profile.fetchedData = response;
        findOrCreateUser(profile.id, 'facebook', profile).then(
          user => done(null, user),
          err => done(err, null));
      });
    },
  ),
);

app.get(
  '/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: true,
  }),
);
app.get(
  '/login/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) =>
  {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
    res.redirect(req.session.returnTo || '/');
    req.session.returnTo = null;
  },
);

passport.use(new LocalStrategy(async (email, password, done)=>
{
  var user = await findLocalUser(email, password, false);
  if (!user)
      return done(null, false, { message: "Incorrect username or password" });
  return done(null, user);
}));

function loginLocalSuccess(req, res, next)
{
  if (!req.user)
  {
    return;
  }
  const expiresIn = 60 * 60 * 24 * 180; // 180 days
  const token = jwt.sign(req.user, config.auth.jwt.secret, { expiresIn });
  res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: true });
  res.send({ message: "success", user: req.user });
  res.status(200);
}

app.post('/login/local', passport.authenticate('local'), loginLocalSuccess);

app.post('/register', async (req, res, next) =>
{
  var email = req.body.username;
  var pwd = req.body.password;
  if (!email || email.length<1 || !pwd || pwd.length<1 || !emailRegex.test(email))
  {
    res.status(406);
    res.send({ status: 406 });  
    return;
  }
  var user = await findLocalUser(email, pwd, true);
  if (!user)
  {
    res.status(406);
    res.send({ status: 406, message: "User with such email already registered" });
    return;
  }
  startConfirm(user);
  return next();
}, passport.authenticate('local'), loginLocalSuccess);

app.get('/logout',
  (req, res) =>
  {
      req.session.passport = null;
      res.clearCookie('id_token');
      res.redirect(req.query.returnTo || '/');
  }
)

function getSimpleUser(user)
{
  if (!user)
    return null;
  return { displayName: user.displayName, photo: user.photo, role: user.role, confirmed: user.confirmed, blocked: user.blocked,
    email: user.email, password: user.passMask, DateCreated: user.DateCreated, DateUpdated: user.DateUpdated, _id: user._id };
}

const ObjectID = require('mongodb').ObjectID;

async function updateUser(req)
{
  var user = getUser(req);
  if (!user)
    return;
  var updatedUser = await mongoAsync.dbCollections.users.findOne({ _id: new ObjectID(user._id) });  
  setUser(req, updatedUser);
}

// API

function processApiGet(apiUrl, serverLogic, options)
{
  app.get(apiUrl, async (req, res) =>
  {
    await serverReady();
    var user = getUser(req);
    var data = await serverLogic(user, req.params, req.query);
    if (!data.status)
      data.status = 200;
    if (options && options.userUpdated)
    {
      await updateUser(req);
      user = getUser(req);
    }
    data.user = getSimpleUser(user);
    res.status(data.status);
    res.send(data);
  });
}

function processApiPost(apiUrl, serverLogic, options)
{
  app.post(apiUrl, async (req, res) =>
  {
    await serverReady();
    var user = getUser(req);
    var body = req.body;
    if (options && options.file)
      body = req;
    var data = await serverLogic(user, body, req.params, req.query);
    if (!data.status)
      data.status = 200;
    if (options && options.userUpdated)
    {
      await updateUser(req);
      user = getUser(req);
    }
    data.user = getSimpleUser(user);
    res.status(data.status);
    res.send(data);
  });
}

function processApiDelete(apiUrl, serverLogic)
{
  app.delete(apiUrl, async (req, res) =>
  {
    await serverReady();
    var user = getUser(req);
    var data = await serverLogic(user, req.params, req.query);
    if (!data.status)
      data.status = 200;
    data.user = getSimpleUser(user);
    res.status(data.status);
    res.send(data);
  });
}

app.get('/api/whoami', async (req, res) =>
{
  res.send({ status: 200, user: getSimpleUser(getUser(req)) });
});

processApiGet('/api/getArticles', getArticles);
processApiGet('/api/article/:id', getArticleInfo);
processApiGet('/api/getArticle/:id', getArticle);
processApiGet('/api/getNewArgument/:id', getNewArgument);
processApiGet('/api/getArgument/:id', getArgument);
processApiGet('/api/checkArticleUrl/:id/:url', checkArticleUrl);
processApiGet('/api/sendPopularVote/:articleId/:voteId', sendPopularVote);
processApiGet('/api/getAccount', getAccount);
processApiGet('/api/getBlog/:blogUrl', getBlogByUrl);
processApiGet('/api/setUserRole/:userId/:role', setUserRole);
processApiGet('/api/transferOwnership/:userId', transferOwnership);
processApiGet('/api/startConfirm', startConfirm);
processApiGet('/api/confirm/:token', endConfirm, { userUpdated: true });
processApiGet('/api/getNotifications', getNotifications);
processApiGet('/api/getUserList', getUserList);
processApiGet('/api/getApprovals', getApprovals);

processApiPost('/api/setArticle', setArticle);
processApiPost('/api/setArgument', setArgument);
processApiPost('/api/setMe', setMe, { userUpdated: true });
processApiPost('/api/upload', upload, { file: true, userUpdated: true });

processApiDelete('/api/deleteArgument/:id', deleteArgument);
processApiDelete('/api/deleteArticle/:id', deleteArticle);

// Serve files from Mongo

app.get('/upload/:filename', async (req, res) =>
{
  mongodb.GridStore.exist(mongoAsync.db, req.params.filename, (err, exists)=>
  {
    if (!err && exists)
    {
      var stream = mongoAsync.fs.openDownloadStream(req.params.filename);
      stream.pipe(res);
    }
    else
    {
      res.status(404);
      res.end();
    }
  });
});

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

    const asyncContext = createAsyncContext();

    context.location = { state: { returnTo: req.session.ssrLastUrl || "/" }};
    if (req.path != "/json") { req.session.ssrLastUrl = req.path; }
    const data = { };

    const reactApp = (
      <UserContext.Provider value={context}>
        <AsyncComponentProvider context={asyncContext}>
          <StaticRouter location={req.url} context={context}>
            <App context={context} />
          </StaticRouter>
        </AsyncComponentProvider>
      </UserContext.Provider>
    );

    await asyncBootstrapper(reactApp);
    if (context.data)
    {
      asyncContext.data = context.data;
    }

    data.children = ReactDOM.renderToString(reactApp);
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

    data.scripts = Array.from(scripts);
    data.app = {
      apiUrl: config.api.clientUrl,
    };
    data.asyncState = asyncContext.getState();
    data.asyncState.resolved.data = asyncContext.data;
    asyncContext.data = null;

    const helmet = Helmet.renderStatic();
    data.helmet = helmet;

    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />)
      .replace('window.ASYNC_COMPONENTS_STATE = null', 'window.ASYNC_COMPONENTS_STATE = ' + serialize(data.asyncState));
    data.asyncState = null;
      res.status(200);
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
  const helmet = Helmet.renderStatic();
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      helmet={helmet}
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

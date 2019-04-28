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
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorPage.css';
import withEverything from '../../withEverything';
import seedrandom from '../../serverLogic/thirdParty/seedrandom';

const messages = [
"Ceci n'est pas une page",
"Скажитє, пожалуйста, как пройті в бібліотєку?",
"Вуйку, то не та полонина",
"Ґандж ся трафив",
"Ви, возміжно, ошиблися страницьою",
"Закон аб дзяржаўнай мове падтрымалі 278 з 347 народных дэпутатаў, зарэгістраваных у сэсійнай залі.",
"Підпис здесь і підпис здесь. Колізія!"
];

class ErrorPage extends React.Component {
  static propTypes = {
    error: PropTypes.shape({
      name: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      stack: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    error: null,
  };

  tryResolve(object, propNames)
  {
      if (!object)
          return null;
      propNames.forEach(propName =>
      {
          var next = object[propName];
          if (!next) return null;
          object = next;
      });
      return object;
  }

  render() {
    var seed = 'default'; // sync random so client uses same seed as server and no SSR warnings are produced
    if (process.env.IS_SERVER)
    {
        seed += Math.random(); // we're on server - initial random seed
        if (this.props.context)
        {
          if (!this.props.context.data) // test page /loading
              this.props.context.data = {};
          this.props.context.data.seed = seed; // save to rehydrate
        }
    }
    else
    {
        // load from rehydrate, if it fails - means that SSR is broken at the moment, so just generate new value
        seed = this.tryResolve(this.props, ['context', 'rehydrateState', 'resolved', 'data', 'seed']) || ('client'+Math.random());
    }
    var rnd = new seedrandom(seed);
    if (__DEV__ && this.props.error) {
      return (
        <div>
          <h1>{this.props.error.name}</h1>
          <pre>{this.props.error.stack}</pre>
        </div>
      );
    }

    return (
      <div className={s.errorContainer}>
        <h1>Помилка</h1>
        {this.props.status ? (
          <h2>Код {this.props.status}</h2>
        ) : null}
        {this.props.message ? (
          <h2>Повідомлення від сервера: {this.props.message}</h2>
        ) : null}
        {this.props.localMessage ? (
          <span>{this.props.localMessage}</span>
        ) : null}
        <p>{messages[Math.floor(rnd() * messages.length)]}</p>
      </div>
    );
  }
}

const withEv = withEverything(ErrorPage, s, null, { status: 404, localMessage: 'Нема такої сторінки' });

export { ErrorPage as ErrorPageWithoutStyle };
export { withEv as ErrorPageWithEverything };
export default withStyles(s)(ErrorPage);

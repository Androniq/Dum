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
import serialize from 'serialize-javascript';
import config from '../config';
import { Helmet } from 'react-helmet';

/* eslint-disable react/no-danger */

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    styles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        cssText: PropTypes.string.isRequired,
      }).isRequired,
    ),
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    app: PropTypes.object, // eslint-disable-line
    children: PropTypes.string.isRequired,
    asyncState: PropTypes.object
  };

  static defaultProps = {
    styles: [],
    scripts: [],
  };

  render() {
    const { description, styles, scripts, app, children, helmet } = this.props;
    return (
      <html className="no-js" lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          {helmet.title.toComponent()}
          <meta name="description" content={description || "ДУМ – демократична українська мова. Сайт про правила української мови, граматику, орфографію, синтаксис, транслітерацію, типові мовні помилки та про епістемологію мови."} />
          {helmet.meta.toComponent()}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {scripts.map(script => (
            <link key={script} rel="preload" href={script} as="script" />
          ))}
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="apple-touch-icon" href="/icon.png" />
          <link rel="stylesheet" href="//cdn.quilljs.com/1.3.6/quill.snow.css" />
          <link rel="stylesheet" href="/global.css" />
          {styles.map(style => (
            <style
              key={style.id}
              id={style.id}
              dangerouslySetInnerHTML={{ __html: style.cssText }}
            />
          ))}
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
          <script type="text/javascript">
              window.ASYNC_COMPONENTS_STATE = null;
          </script>
          <script
            dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }}
          />
          {scripts.map(script => <script key={script} src={script} />)}
          {config.analytics.googleTrackingId && (
            <script
              dangerouslySetInnerHTML={{
                __html:
                  'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
                  `ga('create','${
                    config.analytics.googleTrackingId
                  }','auto');ga('send','pageview')`,
              }}
            />
          )}
          {config.analytics.googleTrackingId && (
            <script
              src="https://www.google-analytics.com/analytics.js"
              async
              defer
            />
          )}
        </body>
      </html>
    );
  }
}

export default Html;

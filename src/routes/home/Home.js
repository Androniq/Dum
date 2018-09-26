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
import s from './Home.css';
import withEverything from '../../withEverything';
import Link from '../../components/Link/Link';

class Home extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.props.data.data.map(item => (
            <article key={item._id} className={s.newsItem}>
              <h3 className={s.newsTitle}>
                <Link to={`/article/${item.Url}`}>{item.PageTitle}</Link>
              </h3>
              <div />
            </article>
          ))}
        </div>
      </div>
    );
  }
}

export default withEverything(Home, s, '/api/getArticles');

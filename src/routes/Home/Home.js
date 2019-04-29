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
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TextInput from '../../components/TextInput/TextInput';

class Home extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = 
    {
      articles: this.props.data.articles
    };
  }

  static propTypes =
  {
  };

  async onSearch(term)
  {
    if (!term)
    {
      this.setState({ articles: this.props.data.articles });
      return;
    }
    var ans = await this.props.context.fetch('/api/searchArticles?q='+term, { method: 'GET' });
    if (ans.status !== 200)
    {
        console.error(ans.status);
        return;
    }
    var json = await ans.json();
    if (!json.success)
    {
        console.error(json.message);
        return;
    }
    this.setState({ articles: json.articles });
  }

  render()
  {
    return (
      <div className={s.root}>
        <Helmet>
          <title>Головна</title>
        </Helmet>
        <div className={s.container}>
          <TextInput noPopup placeholder="Пошук" onSave={this.onSearch.bind(this)} />
          {this.state.articles.map(item => (
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

/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
import Article from './Article';

async function action({ fetch }, params) {
  const articlesResp = await fetch(`/api/article/${params[0]}`, {
    method: 'GET',
  });
  const json = await articlesResp.json();
  var articleData = json.articleData;
  return {
    chunks: ['article'],
    title: articleData.article && articleData.article.PageTitle,
    component: (
      <Layout>
        <Article data={articleData} />
      </Layout>
    ),
  };
}

export default action;

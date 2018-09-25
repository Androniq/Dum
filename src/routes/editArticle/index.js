
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
import EditArticle from './EditArticle';
import { checkPrivilege, USER_LEVEL_MODERATOR } from '../../utility';
import ErrorPage from '../error/ErrorPage';

async function action({ fetch, user }, params) {
  if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
  {
    return {
      title: '403 Дія заборонена',
      component: <ErrorPage name="403 Дія заборонена" message="Ви не маєте дозволу на дію, яку намагалися зробити" stack="-" />
    };
  }
    var articleId = params[0];
    let article = null;
    if (articleId && articleId !== 'new')
    {
        const editArticleResp = await fetch(`/api/getArticle/${params[0]}`, { method: 'GET' });
        article = await editArticleResp.json();
    }
  return {
    chunks: ['editArticle'],
    title: article ? ('Редагування: ' + article.PageTitle) : 'Нова стаття',
    component: (
      <Layout>
        <EditArticle data={article || { Content: { text: '' } }} fetch={fetch} />
      </Layout>
    ),
  };
}

export default action;

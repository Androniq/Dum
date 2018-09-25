
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
import EditArgument from './EditArgument';
import { checkPrivilege, USER_LEVEL_MEMBER } from '../../utility';
import NotFound from '../not-found/NotFound';
import ErrorPage from '../error/ErrorPage';

async function action({ fetch, user }, params) {
  if (!checkPrivilege(user, USER_LEVEL_MEMBER))
  {
    return {
      title: '403 Дія заборонена',
      component: <ErrorPage name="403 Дія заборонена" message="Ви не маєте дозволу на дію, яку намагалися зробити" stack="-" />
    };
  }
    var argumentId = params[0];
    if (!argumentId)
    {
      return {
        title: '404 Сторінку не знайдено',
        component: <NotFound />
      };
    }
    var isNew = argumentId === 'new';
    var fetchApi = isNew ? `/api/getNewArgument/${params[1]}` : `/api/getArgument/${argumentId}`;
    var editArgumentResp = await fetch(fetchApi, { method: 'GET' });
    var data = await editArgumentResp.json();
  return {
    chunks: ['editArgument'],
    title: isNew ? (data.isProposal ? 'Пропозиція' : 'Новий аргумент') : 'Редагування аргументу',
    component: (
      <Layout>
        <EditArgument data={data} fetch={fetch} />
      </Layout>
    ),
  };
}

export default action;

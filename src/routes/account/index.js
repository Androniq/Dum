
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
import Account from './Account';
import { checkPrivilege, USER_LEVEL_MEMBER } from '../../utility';
import ErrorPage from '../error/ErrorPage';

async function action({ fetch, user }) {
 /* if (!checkPrivilege(user, USER_LEVEL_MEMBER))
  {
    return {
      title: '403 Дія заборонена',
      component: <ErrorPage name="403 Дія заборонена" message="Ви не маєте дозволу на дію, яку намагалися зробити" stack="-" />
    };
  }*/
  const accountResp = await fetch(`/api/getAccount`, { method: 'GET' });
  var account = await accountResp.json();
  return {
    chunks: ['account'],
    title: account.displayName,
    component: (
      <Layout>
        <Account data={account} fetch={fetch} />
      </Layout>
    ),
  };
}

export default action;

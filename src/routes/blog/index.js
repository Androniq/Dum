
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
import Blog from './Blog';

async function action({ fetch }, params) {
  const blogsResp = await fetch(`/api/getBlog/${params[0]}`, {
    method: 'GET',
  });
  const blog = await blogsResp.json();
  return {
    chunks: ['blog'],
    title: blog && blog.Title,
    component: (
      <Layout>
        <Blog data={blog} />
      </Layout>
    ),
  };
}

export default action;

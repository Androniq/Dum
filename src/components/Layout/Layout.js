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

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import s from './Layout.css';
import Header from '../Header';
import Footer from '../Footer';
import StickyMessage from '../StickyMessage/StickyMessage';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  state = {};

  render() {
    this.props.context.setLayoutState = this.setState.bind(this);
    return (
      <div>
        <Header context={this.props.context} />
        {this.props.children}
        <Footer context={this.props.context} />
        <StickyMessage message={this.state && this.state.stickyText} visible={this.state && this.state.stickyShown} />
      </div>
    );
  }
}

export default withStyles(normalizeCss, s)(Layout);

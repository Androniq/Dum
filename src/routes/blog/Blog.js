import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Blog.css';
import classnames from 'classnames';
import { UserContext } from '../../UserContext.js';
import FormattedText from '../../components/FormattedText/FormattedText';

class Blog extends React.Component {
  static propTypes = {};

  render()
  {
      return (
          <div className={s.blogContainer}>
              <div className={s.blogHeader}>
                <div className={s.blogTitle}>
                    <h2 className={s.blogTitleH}>{this.props.data.Title}</h2>
                    <div className={s.authorArea}>
                        <div className={s.userCardContainer}>
                            <span className={s.userCardName}>{this.props.data.Owner.displayName}</span>
                            <img className={s.userCardAvatar} src={this.props.data.Owner.photo} />
                        </div>
                        <span className={s.authorAreaDate}>{new Date(this.props.data.DateCreated).toLocaleDateString('uk-UA')}</span>
                    </div>
                </div>
              </div>
              <FormattedText html={this.props.data.Content} />
          </div>
      );
  }
}

export default withStyles(s)(Blog);

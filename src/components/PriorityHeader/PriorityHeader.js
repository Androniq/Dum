import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './PriorityHeader.css';
import classnames from 'classnames';

class PriorityHeader extends React.Component {
  static propTypes = {
      priorityTitle: PropTypes.string.isRequired,
      popularOverride: PropTypes.bool,
      voteFor: PropTypes.string.isRequired,
      isOpen: PropTypes.bool.isRequired
  };

  render()
  {
      return (
        <div className={s.priorityHeader}>
            <span className={s.priorityTitle}>{this.props.priorityTitle}:</span>
            {this.props.popularOverride ? (
                <span className={s.priorityPopularOverride}>(популярне голосування)</span>
            ) : ""}
            <span className={s.priorityVoteFor}>{this.props.voteFor}</span>
            <img src="/images/expandArrow.png" className={classnames(s.priorityCollapseIndicator,
                    this.props.isOpen ? s.priorityCollapseIndicatorOpen : s.priorityCollapseIndicatorClose)} />
        </div>
      );
  }
}

export default withStyles(s)(PriorityHeader);
import React from 'react';
import PropTypes from 'prop-types';
import s from './Approvals.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import FormattedText from '../../components/FormattedText/FormattedText';
import { DEFAULT_USERPIC } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class Approvals extends React.Component
{
    clickApprove(item)
    {
    }

    clickDeny(item)
    {
    }

    clickViewUser(item)
    {
    }

    clickViewArticle(item)
    {
    }

    clickBan(item)
    {
    }

    render()
    {
        this.props.data.proposedArgs.forEach(proposedArg =>
            {
                var articleId = proposedArg.Article;
                var article = this.props.data.articles.find(it => it.ID === articleId);
                proposedArg.ArticleInst = article;
                var voteId = proposedArg.Vote;
                var vote = this.props.data.votes.find(it => it.ID === voteId);
                proposedArg.VoteInst = vote;
                proposedArg.voteDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
                var priorityId = proposedArg.Priority;
                var priority = this.props.data.priorities.find(it => it.ID == priorityId);
                proposedArg.PriorityInst = priority;
                var userId = proposedArg.Owner;
                var user = this.props.data.users.find(it => it._id === userId);
                proposedArg.User = user;
            });
        return (
            <div className="container">
                <Helmet>
                    <title>Пропозиції</title>
                </Helmet>
                <div className={s.itemList}>
                    {this.props.data.proposedArgs.map(item => (
                        <div key={item._id} className={s.itemContainer}>
                            <div className={s.labelContainer}>
                                <span className={cx(s.labelBase, s.labelTokenA)}>{item.ArticleInst.TokenA}</span>
                                <span className={cx(s.labelBase, s.labelTokenB)}>{item.ArticleInst.TokenB}</span>
                            </div>
                            <div className={s.labelContainer}>
                                <span className={cx(s.labelBase, s.labelVote)}>{item.voteDescription}</span>
                                <span className={cx(s.labelBase, s.labelPriority)}>{item.PriorityInst.Title}</span>
                            </div>
                            <div className={s.contentContainer}>
                                <FormattedText html={item.Content} />
                            </div>
                            <div className={s.panel}>
                                <div className={s.avatar}>
                                    <img src={item.User && item.User.photo || DEFAULT_USERPIC} className="userpic" />
                                </div>
                                <div className={s.username}>
                                    <span>{item.User && item.User.displayName || "Анонім"}</span>
                                </div>
                                <BlueButton onClick={(()=>this.clickViewUser(item)).bind(this)}>Переглянути користувача</BlueButton>
                                <BlueButton onClick={(()=>this.clickViewArticle(item)).bind(this)}>Переглянути статтю</BlueButton>
                            </div>
                            <div className={s.panel}>
                                <BlueButton onClick={(()=>this.clickApprove(item)).bind(this)}>Схвалити</BlueButton>
                                <BlueButton onClick={(()=>this.clickDeny(item)).bind(this)}>Відхилити</BlueButton>
                                <BlueButton onClick={(()=>this.clickBan(item)).bind(this)}>БАН!</BlueButton>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default withEverything(Approvals, s, '/api/getApprovals');
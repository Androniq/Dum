import React from 'react';
import PropTypes from 'prop-types';
import s from './Approvals.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import FormattedText from '../../components/FormattedText/FormattedText';
import { DEFAULT_USERPIC, goToLink } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class Approvals extends React.Component
{
    async clickApprove(item)
    {
        var url = "/api/approveProposal/" + item._id;
        var resp = await this.props.context.fetch(url, { method: 'POST' });
        if (!resp.ok)
        {
            console.error(resp.message);
            return;
        }
        window.location.reload();
    }

    async clickReject(item)
    {
        var url = "/api/rejectProposal/" + item._id;
        var resp = await this.props.context.fetch(url, { method: 'DELETE' });
        if (!resp.ok)
        {
            console.error(resp.message);
            return;
        }
        window.location.reload();
    }

    clickViewUser(item)
    {
        window.open("/viewProfile/" + item.User._id, "_blank");
    }

    clickViewArticle(item)
    {
        window.open("/article/" + item.ArticleInst.Url, "_blank");
    }

    clickBan(item)
    {
    }

    render()
    {
        this.props.data.proposedArgs.forEach(proposedArg =>
            {
                var articleId = proposedArg.Article;
                var userId = proposedArg.Owner;
                var user = this.props.data.users.find(it => it._id.toString() === userId);
                proposedArg.User = user;
                if (articleId)
                {
                    var article = this.props.data.articles.find(it => it._id.toString() === articleId);
                    if (!article)
                    {
                        proposedArg.Article = null;
                        return;
                    }
                    proposedArg.ArticleInst = article;
                    var voteId = proposedArg.Vote;
                    var vote = this.props.data.votes.find(it => it._id.toString() === voteId);
                    proposedArg.VoteInst = vote;
                    proposedArg.voteDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
                    var priorityId = proposedArg.Priority;
                    var priority = this.props.data.priorities.find(it => it._id.toString() == priorityId);
                    proposedArg.PriorityInst = priority;

                    if (proposedArg.RootId)
                    {
                        var rootArg = this.props.data.contestedArgs.find(it => it._id.toString() === proposedArg.RootId);
                        proposedArg.RootArg = rootArg;
                        var current = rootArg;
                        for (let index = 0; index < proposedArg.IdChain.length; index++)
                        {
                            var counterId = proposedArg.IdChain[index];
                            current = current.Counters.find(it => it._id.toString() === counterId);
                        }
                        proposedArg.Contested = current;
                    }
                }
            });
        return (
            <div className="container">
                <Helmet>
                    <title>Пропозиції</title>
                </Helmet>
                <div className={s.itemList}>
                    {this.props.data.proposedArgs.length ? "" : 
                        <span className={s.noNewProposals}>Нових пропозицій немає</span>
                    }
                    {this.props.data.proposedArgs.map(item => item.Article ? (                        
                        <div key={item._id} className={s.itemContainer}>
                            <div className={s.labelContainer}>
                                <span className={cx(s.labelBase, s.labelTokenA)}>{item.ArticleInst.TokenA}</span>
                                <span className={cx(s.labelBase, s.labelTokenB)}>{item.ArticleInst.TokenB}</span>
                            </div>
                            <div className={s.labelContainer}>
                                <span className={cx(s.labelBase, s.labelVote)}>{item.voteDescription}</span>
                                <span className={cx(s.labelBase, s.labelPriority)}>{item.PriorityInst.Title}</span>
                            </div>
                            {item.RootId ? (
                                <div className={s.counterContainer}>
                                    <span className={s.counterHeader}>Контраргумент до:</span>
                                    <div className={s.contentContainer}>
                                        <FormattedText html={item.Contested.Content} />
                                    </div>
                                </div>
                            ) : null}
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
                                <BlueButton onClick={(()=>this.clickReject(item)).bind(this)}>Відхилити</BlueButton>
                                <BlueButton onClick={(()=>this.clickBan(item)).bind(this)}>БАН!</BlueButton>
                            </div>
                        </div>
                        ) : (
                        <div key={item._id} className={s.itemContainer}>
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
                            </div>
                            <div className={s.panel}>
                                <BlueButton onClick={(()=>this.clickApprove(item)).bind(this)}>Переглянуто</BlueButton>
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
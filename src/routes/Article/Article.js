import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Article.css';
import classnames from 'classnames';
import Chart from 'react-chartjs-2';
import { UserContext } from '../../UserContext.js';
import Popup from "reactjs-popup";
import Collapsible from 'react-collapsible';
import PriorityHeader from '../../components/PriorityHeader/PriorityHeader';
import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
  USER_LEVEL_OWNER, 
  showSticky,
  goToLink} from '../../utility';
import history from '../../history';
import BlueButton from '../../components/BlueButton/BlueButton';
import VoteButton from '../../components/VoteButton/VoteButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import Argument from '../../components/Argument/Argument';

class Article extends React.Component {
  static propTypes = {};

  state = {
    ownVote: 'N',
    votePopupOpen: false
  };

  constructor(props)
  {
    super(props);
    this.state = { ownVote: props.data.ownVote };
  }

chartData(articleData)
{
  let data =
  {
    labels: articleData.voteResults.map(function(element) { return element.vote.ShortDescription; }),
    datasets: [{
      label: 'Популярне голосування, %',
      data: articleData.voteResults.map(function(element) { return element.popular; }),
      backgroundColor: [
        'rgba(255, 0, 0, 0.2)',
        'rgba(255, 255, 0, 0.2)',
        'rgba(0, 255, 0, 0.2)',
        'rgba(255, 255, 0, 0.2)',
        'rgba(255, 0, 0, 0.2)',
        'rgba(0, 0, 255, 0.2)'
      ],
      borderColor: [
        'rgba(255, 0, 0, 1)',
        'rgba(255, 255, 0, 1)',
        'rgba(0, 255, 0, 1)',
        'rgba(255, 255, 0, 1)',
        'rgba(255, 0, 0, 1)',
        'rgba(0, 0, 255, 1)'
      ],
      borderWidth: 1
    }]
  };
  return data;
}

chartOptions()
{
  let options = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    maintainAspectRatio: true
  };
  return options;
}

getVoteOption(code)
{
  return this.props.data.voteResults.find(function(element) { return element.vote.Code === code; });
}

onVotePopupOpen()
{
  this.setState({ votePopupOpen: true });
}

onVotePopupClose()
{
  this.setState({ votePopupOpen: false });
}

clickVote(code)
{
  let optionId = this.getVoteOption(code).vote._id;
  if (code === this.state.ownVote)
  {
    optionId = 'null';
    code = 'N';
  }
  return async () => this.clickVoteDo(code, optionId);
}

async clickVoteDo(code, optionId)
{
  var resp = await fetch(`/api/sendPopularVote/${this.props.data.article._id}/${optionId}`);
  var message = await resp.json();
  if (message.success)
  {
    await this.setState({ ownVote: code, votePopupOpen: false });
    showSticky(this, message.message === "Success (vote undone)" ? "Ви відкликали свій голос" : "Ваш голос враховано!");
  }
}

voteButton(code)
{
  var opt = this.getVoteOption(code);
  var hint = opt.vote.HintTemplate.replace('%A%', this.props.data.article.ShortA).replace('%B%', this.props.data.article.ShortB);
  return (
    <VoteButton code={code} ownVote={this.state.ownVote} onClick={this.clickVote(code)} hint={hint}>
      {opt.vote.ShortestDescription}
    </VoteButton>
  );
}

clickEdit()
{
  goToLink(this, '/editArticle/' + this.props.data.article.Url);
}

clickArgument()
{
  goToLink(this, '/editArgument/new/' + this.props.data.article.Url);
}
  async gotoHistory()
  {
      goToLink(this, "/viewHistory/" + this.props.data.article._id);
  }

  getKeywords()
  {
    const universalKeywords = "ДУМ, демократична, українська, мова, як правильно, граматика, орфографія, пунктуація, синтаксис, транслітерація";
    var localKeywords = this.props.data.article.Keywords;

    if (localKeywords && localKeywords.length)
      return localKeywords + ", " + universalKeywords;
    return universalKeywords;
  }

  render()
  {
    return (
      <React.Fragment>
        <Helmet>
          <title>{this.props.data.article.PageTitle}</title>
          <meta name="keywords" content={this.getKeywords()} />
        </Helmet>
        <div className={s.infoArea}>
          <div className={s.tokenHeader}
            style={{ backgroundColor: this.props.data.result.ColorCode, color: this.props.data.result.WhiteText ? "white" : "black" }}>
            <span className={classnames(s.tokenBase, s.tokenA)}>{this.props.data.article.TokenA}</span>
            <span className={classnames(s.tokenBase, s.tokenB)}>{this.props.data.article.TokenB}</span>
          </div>
          <h3 className={s.generalResult}>{this.props.data.result.Description}</h3>
          <FormattedText html={this.props.data.article.Content} />
          <Chart type="horizontalBar" data={this.chartData(this.props.data)} options={this.chartOptions()} />
          <span className={s.totalVotes}>Усього голосів: {this.props.data.totalPopular}</span>
          <UserContext.Consumer>
            {context => context.user ? context.user.confirmed ? !context.user.blocked ? (
              <div className={s.buttonContainer}>
                <Popup trigger={<BlueButton>Голосувати!</BlueButton>} position="top center"
                  open={this.state.votePopupOpen} onOpen={this.onVotePopupOpen.bind(this)} onClosed={this.onVotePopupClose.bind(this)} modal>
                  <div className={s.pvContainer}>
                    {this.voteButton('A')}
                    {this.voteButton('AB')}
                    {this.voteButton('EQ')}
                    {this.voteButton('BA')}
                    {this.voteButton('B')}
                    {this.voteButton('S')}
                  </div>
                </Popup>
                <BlueButton onClick={this.clickArgument.bind(this)}>Аргументувати...</BlueButton>
                {checkPrivilege(context.user, USER_LEVEL_MODERATOR) ? (
                  <BlueButton onClick={this.clickEdit.bind(this)}>Редагувати</BlueButton>
                ) : ""}
                {checkPrivilege(context.user, USER_LEVEL_ADMIN) ? (
                  <BlueButton onClick={this.gotoHistory.bind(this)}>Історія змін</BlueButton>
                ) : ""}
              </div>
            ) : (
                <div className={s.containerNotAuthorized}>
                  <span className={s.textNotAuthorized}>Ви не маєте права голосувати</span>
                </div>
              ) : (
                <div className={s.containerNotAuthorized}>
                  <span className={s.textNotAuthorized}>Щоб голосувати, потрібно підтвердити свою адресу електронної пошти</span>
                </div>
              ) : (
                <div className={s.containerNotAuthorized}>
                  <span className={s.textNotAuthorized}>Щоб голосувати, потрібно авторизуватися</span>
                </div>
              )}
          </UserContext.Consumer>
          <UserContext.Consumer>
            {context => (
              <div className={s.prioritiesContainer}>
                {this.props.data.priorityList.map(priority =>
                  <div key={priority.priority._id} className={s.priorityContainer}>
                    <Collapsible trigger={(
                      <PriorityHeader priorityTitle={priority.priority.Title} popularOverride={priority.priority.popularOverride}
                        voteFor={priority.voteFor} isOpen={false} />
                    )} triggerWhenOpen={(
                      <PriorityHeader priorityTitle={priority.priority.Title} popularOverride={priority.priority.popularOverride}
                        voteFor={priority.voteFor} isOpen={true} />
                    )}
                      easing="ease">
                      <div className={s.priorityArgs}>
                        {priority.arguments.length ? "" : (
                          <span className={s.priorityArgsEmpty} />
                        )}
                        {priority.arguments.map(argument =>
                          <Argument key={argument._id} argument={argument} priority={priority} user={context.user} />
                        )}
                      </div>
                    </Collapsible>
                  </div>
                )}
              </div>
            )}
          </UserContext.Consumer>
        </div>
      </React.Fragment>
    );
  }
}

export default withEverything(Article, s, '/api/article/:id');

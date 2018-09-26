import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditArgument.css';
import classnames from 'classnames';
import { UserContext } from '../../UserContext';
import TextInput from '../../components/TextInput/TextInput';
import history from '../../history';
import { guid, quillToolbarOptions, htmlNonEmpty } from '../../utility';
import Select from 'react-select';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import Popup from "reactjs-popup";
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import QuillWrapper from '../../components/QuillWrapper/QuillWrapper';

class EditArgument extends React.Component {
  static propTypes = {};

  state = {
    Vote: '',
    Priority: '',
    Content: '',
    priorityDescription: '',
    voteDescription: ''
  };

  constructor(props)
  {
    super(props);
    this.props.data.priorityItems = this.props.data.priorities.map(it => { return { value: it.ID, label: it.Title }; });
    this.props.data.voteItems = this.props.data.votes.map(it => { return { value: it.ID, label: it.ShortDescription }; });
    this.state.voteDescription = this.getVoteDescription(this.props.data.argument.Vote);
    this.state.priorityDescription = this.getPriorityDescription(this.props.data.argument.Priority);
    this.state.Content = this.props.data.argument.Content;
  }

getTitle(type)
{
  switch (type)
  {
    case 'new': return 'Новий аргумент';
    case 'proposal': return 'Пропозиція';
    case 'edit': return 'Редагування аргументу';
  }  
}

getPriorityDescription(id)
{
  var item = this.props.data.priorities.find(it => it.ID === id);
  return item && item.Description;
}
  
getVoteDescription(id)
{
  var item = this.props.data.votes.find(it => it.ID === id);
  return item && item.Description;
}

updateVote(value) { this.setState({ Vote: value, voteDescription: this.getVoteDescription(value.value), voteValidator: null }); }
updatePriority(value) { this.setState({ Priority: value, priorityDescription: this.getPriorityDescription(value.value), priorityValidator: null }); }
updateContent(value) { this.setState({Content:value}); }

componentWillMount()
{
  var argument = this.props.data;
  if (argument)
  {
    this.setState(argument);
  }
}

onContentChanged(content)
{
  this.setState({ Content: content, contentValidator: null });
}

async onSave()
{
  var valid = true;
  if (!this.state.Priority.value)
  {
    valid = false;
    await this.setState({ priorityValidator: s.validationFail });
  }

  if (!this.state.Vote.value)
  {
    valid = false;
    await this.setState({ voteValidator: s.validationFail });
  }

  if (!this.state.Content || !htmlNonEmpty(this.state.Content))
  {
    valid = false;
    await this.setState({ contentValidator: s.validationFail });
  }

  if (!valid)
  {
    return;
  }

  var argument = this.props.data.argument;
  argument.Vote = this.state.Vote.value;
  argument.Priority = this.state.Priority.value;
  argument.Content = this.state.Content;
  var text = JSON.stringify(argument);

  var res = await this.props.fetch('/api/setArgument', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
  var resj = await res.json();
  if (resj.success)
  {
    var redirect = { pathname: '/article/' + this.props.data.article.Url };
    if (this.props.data.isProposal)
    {
      redirect.state = { initMessage: "Ваш аргумент прийнято до розгляду!" };
    }
    this.props.history.push(redirect);
  }
  else
  {
    console.error(resj.message);
  }
}

placeholderApplyStyle(style)
{
  style["white-space"] = "nowrap";
  style["text-overflow"] = "ellipsis";
  style["overflow"] = "hidden";
  style["max-width"] = "360px";
  return style;
}

onCancel()
{
  this.props.history.push('/article/' + this.props.data.article.Url);
}

onDelete()
{
  this.setState({assertDelete:true});
}

onCancelDeletion()
{
  this.setState({assertDelete:false});
}

async onDeleteDo()
{
  var res = await this.props.fetch('/api/deleteArgument/' + this.props.data.argument._id, {method:'DELETE', headers: { "Content-Type": "application/json" }});
  var resj = await res.json();
  if (resj.success)
  {
    this.props.history.push('/article/' + this.props.data.article.Url);
  }
  else
  {
    console.error(resj.message);
  }
}

  render()
  {
      return (
          <div className={s.editArgumentContainer}>
            <Helmet>
              <title>{this.getTitle(this.props.data.type)}</title>
            </Helmet>
            <div className={s.tokenHeader}>
              <span className={classnames(s.tokenBase, s.tokenA)}>{this.props.data.article.TokenA}</span>
              <span className={classnames(s.tokenBase, s.tokenB)}>{this.props.data.article.TokenB}</span>
            </div>
            <div className={s.editArgumentGrid}>
              <Select
                className={classnames(s.comboBox, s.grid11, this.state.priorityValidator)}
                options={this.props.data.priorityItems}
                onChange={this.updatePriority.bind(this)}
                placeholder="Виберіть пріоритет"
                styles={{placeholder:this.placeholderApplyStyle}}
                defaultValue={this.props.data.priorityItems.find(it => it.value === this.props.data.argument.Priority)} />
              <Select
                className={classnames(s.comboBox, s.grid12, this.state.voteValidator)}
                options={this.props.data.voteItems}
                onChange={this.updateVote.bind(this)}
                placeholder="На користь якого варіанту ваш аргумент?"
                styles={{placeholder:this.placeholderApplyStyle}}
                defaultValue={this.props.data.voteItems.find(it => it.value === this.props.data.argument.Vote)} />
              <div className={classnames(s.descriptionBox, s.grid21)}>
                <FormattedText html={this.state.priorityDescription }/>
              </div>
              <div className={classnames(s.descriptionBox, s.grid22)}>
                <FormattedText html={this.state.voteDescription }/>
              </div>
            </div>
            <div className={classnames(s.contentEditor, this.state.contentValidator)}>
              <QuillWrapper value={this.state.Content} onChange={this.onContentChanged.bind(this)} />
            </div>
            <div className={s.buttonsContainer}>
              <BlueButton onClick={this.onSave.bind(this)}>{this.props.data.isProposal ? "Запропонувати" : "Зберегти"}</BlueButton>
              <BlueButton onClick={this.onCancel.bind(this)}>Повернутися</BlueButton>
              {this.props.data.argument && this.props.data.argument._id ? (
                <BlueButton onClick={this.onDelete.bind(this)}>Видалити аргумент</BlueButton>
              ) : ""}
            </div>
            <Popup modal open={this.state.assertDelete} onClose={this.onCancelDeletion.bind(this)}>
              <div className={s.modalContainer}>
                <span className={s.modalText}>Ви точно бажаєте видалити цей аргумент?</span>
                <div className={s.modalButtons}>
                  <BlueButton onClick={this.onDeleteDo.bind(this)}>Так</BlueButton>
                  <BlueButton onClick={this.onCancelDeletion.bind(this)}>Ні</BlueButton>
                </div>
              </div>
            </Popup>
          </div>
      );
  }
}

export default withEverything(EditArgument, s, [ { condition: q => q.argId === 'new', value: '/api/getNewArgument/:articleId' }, '/api/getArgument/:argId' ]);

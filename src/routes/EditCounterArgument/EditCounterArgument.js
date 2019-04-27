import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditCounterArgument.css';
import classnames from 'classnames';
import { UserContext } from '../../UserContext';
import TextInput from '../../components/TextInput/TextInput';
import history from '../../history';
import { guid, quillToolbarOptions, htmlNonEmpty, showSticky } from '../../utility';
import Select from 'react-select';
import BlueButton from '../../components/BlueButton/BlueButton';
import FormattedText from '../../components/FormattedText/FormattedText';
import Popup from "reactjs-popup";
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import QuillWrapper from '../../components/QuillWrapper/QuillWrapper';

class EditCounterArgument extends React.Component {
  static propTypes = {};

  state = {
    Content: '',
  };

  constructor(props)
  {
    super(props);

    var idChainString = this.props.match.params.idChain;
    var idChain = idChainString.split('.');
    console.info(idChain);
    var current = this.props.data.argument;
    var parent = current;
    var type = 'edit';
    for (let index = 0; index < idChain.length; index++)
    {
        parent = current;
        var id = idChain[index];
        if (id === 'new')
        {
            type = this.props.data.isProposal ? 'proposal' : 'new';
            if (!current.Counters)
                current.Counters = [];
            let newCounter = { _id: guid(), Content: "<p></p>" };
            current.Counters.push(newCounter);
            current = newCounter;
        }   
        else
        {         
            current = current.Counters.find(it => it._id === idChain[index]);
        }
    }
    this.state.Content = current.Content;
    this.state.Parent = parent;
    this.state.Current = current;
    this.state.Type = type;
    this.state.IdChain = idChain;
  }

getTitle()
{
  switch (this.state.Type)
  {
    case 'new': return 'Новий контраргумент';
    case 'proposal': return 'Пропозиція';
    case 'edit': return 'Редагування контраргументу';
  }  
}

updateContent(value) { this.setState({ Content:value }); }

onContentChanged(content)
{
  this.setState({ Content: content, contentValidator: null });
}

async sendProposal()
{
    var argument = this.props.data.argument;
    this.state.Current.Content = this.state.Content;
    var cargument = this.state.Current;
    cargument.IdChain = this.state.IdChain;
    cargument.IdChain.pop();
    cargument.RootId = argument._id;
    cargument.Vote = argument.Vote;
    cargument.Priority = argument.Priority;
    cargument.Article = argument.Article;
    var text = JSON.stringify(cargument);
  
    var res = await this.props.context.fetch('/api/proposeCounterArgument', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
    var resj = await res.json();
    if (resj.success)
    {
      var redirect = { pathname: '/article/' + this.props.data.article.Url };
      this.props.history.push(redirect);
    }
    else
    {
      console.error(resj.message);
    }
    showSticky(this, "Ваш контраргумент прийнято до розгляду!");
}

async onSave()
{
  var valid = true;
  if (!this.state.Content || !htmlNonEmpty(this.state.Content))
  {
    valid = false;
    await this.setState({ contentValidator: s.validationFail });
  }

  if (!valid)
  {
    return;
  }

  if (this.props.data.isProposal)
  {
      await this.sendProposal();
      return;
  }

  var argument = this.props.data.argument;
  this.state.Current.Content = this.state.Content;
  var text = JSON.stringify(argument);

  var res = await this.props.context.fetch('/api/setArgument', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
  var resj = await res.json();
  if (resj.success)
  {
    var redirect = { pathname: '/article/' + this.props.data.article.Url };
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
    this.state.Parent.Counters.splice(this.state.Parent.Counters.indexOf(this.state.Current));
    var argument = this.props.data.argument;
    var text = JSON.stringify(argument);
  
    var res = await this.props.context.fetch('/api/setArgument', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
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
              <title>{this.getTitle()}</title>
            </Helmet>
            <div className={s.tokenHeader}>
              <span className={classnames(s.tokenBase, s.tokenA)}>{this.props.data.article.TokenA}</span>
              <span className={classnames(s.tokenBase, s.tokenB)}>{this.props.data.article.TokenB}</span>
            </div>
            <div>
                <h3>Аргумент, який ви оскаржуєте:</h3>
                <FormattedText html={this.state.Parent.Content} />
            </div>
            <div className={classnames(s.contentEditor, this.state.contentValidator)}>
              <QuillWrapper value={this.state.Content} onChange={this.onContentChanged.bind(this)} />
            </div>
            <div className={s.buttonsContainer}>
              <BlueButton onClick={this.onSave.bind(this)}>{this.props.data.isProposal ? "Запропонувати" : "Зберегти"}</BlueButton>
              <BlueButton onClick={this.onCancel.bind(this)}>Повернутися</BlueButton>
              {this.state.Type === "edit" ? (
                <BlueButton onClick={this.onDelete.bind(this)}>Видалити контраргумент</BlueButton>
              ) : ""}
            </div>
            <Popup modal open={this.state.assertDelete} onClose={this.onCancelDeletion.bind(this)}>
              <div className={s.modalContainer}>
                <span className={s.modalText}>Ви точно бажаєте видалити цей контраргумент?</span>
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

export default withEverything(EditCounterArgument, s, '/api/getArgument/:argId');

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './EditArticle.css';
import classnames from 'classnames';
import { UserContext } from '../../UserContext';
import TextInput from '../../components/TextInput/TextInput';
import history from '../../history';
import { guid, quillToolbarOptions, htmlNonEmpty, checkPrivilege, USER_LEVEL_ADMIN } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';
import Popup from "reactjs-popup";
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import QuillWrapper from '../../components/QuillWrapper/QuillWrapper';

var urlRegex = RegExp("^([A-Za-z0-9_-]*)$");

class EditArticle extends React.Component {
  static propTypes = {};

  state = {
    Title: '',
    PageTitle: '',
    Keywords: '',
    Url: '',
    TokenA: '',
    TokenB: '',
    ShortA: '',
    ShortB: '',
    Content: ''
  };

getTitle(data)
{
  var article = data && data.article;
  return article ? ('Редагування: ' + article.PageTitle) : 'Нова стаття';
}

updateTitle(value) { this.setState({Title:value, validatorTitle:null}); }
updatePageTitle(value) { this.setState({PageTitle:value, validatorPageTitle:null}); }
updateKeywords(value) { this.setState({Keywords:value, validatorKeywords:null}); }
updateUrl(value) { this.setState({Url:value, validatorUrl:null}); this.checkUrl(value); } 
updateTokenA(value) { this.setState({TokenA:value, validatorTokenA:null}); }
updateTokenB(value) { this.setState({TokenB:value, validatorTokenB:null}); } // somewhere here I regretted I didn't choose Angular
updateShortA(value) { this.setState({ShortA:value, validatorShortA:null}); }
updateShortB(value) { this.setState({ShortB:value, validatorShortB:null}); }

componentWillMount()
{
  var article = this.props.data;
  if (article)
  {
    this.setState(article);
  }
}

onContentChanged(content)
{
  this.setState({ Content:content, validatorContent:null });
}

async checkUrl(url)
{
  if (!url || url === 'new' || !urlRegex.test(url))
  {
    this.setState({ urlUnique: false });
    return;
  }
  var id = 'null';
  if (this.props.data && this.props.data._id)
    id = this.props.data._id;
  var check = await this.props.fetch('/api/checkArticleUrl/' + id +'/' + url,  {method:'GET', headers: { "Content-Type": "application/json" }});
  var result = await check.json();
  this.setState({ urlUnique: result.success });
}

async onSave()
{
  var valid = true;

  var validatorSetter = {};
  ['Title','PageTitle','Url','Keywords','TokenA','TokenB','ShortA','ShortB'].forEach(item =>
    {
        var value = this.state[item];
        if (!value || !value.length)
        {
          valid = false;
          validatorSetter["validator"+item] = s.validationFail;          
        }
    });
  if (this.state.urlUnique === false)
  {
    valid = false;
    validatorSetter.validatorUrl = s.validationFail;
  }
  if (!this.state.Content || !htmlNonEmpty(this.state.Content))
  {
    valid = false;
    validatorSetter.validatorContent = s.validationFail;
  }
  if (!valid)
  {
    await this.setState(validatorSetter);
    return;
  }

  var article = this.props.data;
  article.Title = this.state.Title;
  article.PageTitle = this.state.PageTitle;
  article.Keywords = this.state.Keywords;
  article.Url = this.state.Url;
  article.TokenA = this.state.TokenA;
  article.TokenB = this.state.TokenB;
  article.ShortA = this.state.ShortA;
  article.ShortB = this.state.ShortB;
  article.Content = this.state.Content;
  var text = JSON.stringify(article);

  var res = await this.props.fetch('/api/setArticle', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
    var resj = await res.json();
  if (resj.success)
  {
    this.props.history.push('/article/' + article.Url);
  }
  else
  {
    console.error(resj.message);
  }
}

onCancel()
{
  if (this.props.data && this.props.data.Url)
    this.props.history.push('/article/' + this.props.data.Url);
  else
    {
      this.props.history.goBack();
    }
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
  var res = await this.props.fetch('/api/deleteArticle/' + this.props.data._id, {method:'DELETE', headers: { "Content-Type": "application/json" }});
  var resj = await res.json();
  if (resj.success)
  {
    this.props.history.push('/');
  }
  else
  {
    console.error(resj.message);
  }
}

  render()
  {    
      return (
          <div className={s.editArticleContainer}>
            <Helmet>
              <title>{this.getTitle(this.props.data)}</title>
            </Helmet>
            <div className={s.editArticleGrid}>
              <TextInput className={classnames(s.textInput, s.grid11, this.state.validatorTitle)} placeholder="Коротка назва статті, наприклад: Вірно"
                onSave={this.updateTitle.bind(this)} value={this.state.Title}
                hint="Напишіть тут коротку назву, за якою можна буде швидко ідентифікувати статтю: лише підозріла лексема, наприклад, «Вірно»." />
              <TextInput className={classnames(s.textInput, s.grid12, this.state.validatorPageTitle)} placeholder="Повна назва статті, наприклад: Вірно чи правильно?"
                onSave={this.updatePageTitle.bind(this)} value={this.state.PageTitle}
                hint="Назва, яка відображатиметься в заголовку вкладки у веб-оглядачі. Бажано використовувати формат: [Підозріла лексема] чи [надійна лексема]?, наприклад: «Вірно чи правильно?»." />
               <div className={classnames(s.urlValidator, s.grid21)}>
                  <TextInput className={classnames(s.textInput, s.urlBoxSpecial, this.state.validatorUrl)} placeholder="Адреса сторінки латинкою, наприклад: virno"
                    onSave={this.updateUrl.bind(this)} value={this.state.Url}
                    hint="Фрагмент URL, який використовуватиметься для навігації до цієї сторінки. Повинен бути унікальним (перевірка виконується автоматично). Найкраще, якщо це буде латинізація короткої назви (наприклад, «virno»)." />
                  <img className={classnames(s.urlValidatorOk, this.state.urlUnique === true ? s.visible : s.invisible)} src='/images/ok.png' />
                  <img className={classnames(s.urlValidatorFail, this.state.urlUnique === false ? s.visible : s.invisible)} src='/images/error.png' />
              </div>
              <TextInput className={classnames(s.textInput, s.grid22, this.state.validatorKeywords)} placeholder="Ключові слова через кому: вірно, вірний, вірніше"
                onSave={this.updateKeywords.bind(this)} value={this.state.Keywords}
                hint="Перелік розділених комою ключових слів, за якими користувачі сайту шукатимуть цю статтю. Включіть сюди також похідні та споріднені слова з інших частин мови, наприклад: «співпадіння, співпадати». Важливо вказати саме підозрілу лексему – користувачі рідко шукають статтю за надійною лексемою." />
              <TextInput className={classnames(s.textInput, s.grid31, this.state.validatorTokenA)} placeholder="Лексема А з на́голосом, наприклад: Ві́рно"
                onSave={this.updateTokenA.bind(this)} value={this.state.TokenA}
                hint="«Ліва» (підозріла) лексема. (Якщо вона раптом переможе в голосуванні, то сайт автоматично поміняє лексеми місцями при відображенні.) Використовуйте знак на́голосу і уточнення, наприклад: «Ві́рно (у значенні «правильно»)». Якщо ви не знаєте, як ставити наголос, то просто поставте зірочку (*) після наголошеної літери, наприклад: «Ві*рно» – система сама замінить її на наголос після натиснення кнопки «Зберегти»." />
              <TextInput className={classnames(s.textInput, s.grid32, this.state.validatorTokenB)} placeholder="Лексема Б з на́голосом, наприклад: Пра́вильно"
                onSave={this.updateTokenB.bind(this)} value={this.state.TokenB}
                hint="«Права» (надійна) лексема. (Якщо вона раптом програє в голосуванні, то сайт автоматично поміняє лексеми місцями при відображенні.) Пишіть з великої букви і використовуйте знак на́голосу, наприклад: «Пра́вильно». Якщо ви не знаєте, як ставити наголос, то просто поставте зірочку (*) після наголошеної літери, наприклад: «Ві*рно» – система сама замінить її на наголос після натиснення кнопки «Зберегти»." />
              <TextInput className={classnames(s.textInput, s.grid41, this.state.validatorShortA)} placeholder="Лексема А коротко, наприклад: вірно"
                onSave={this.updateShortA.bind(this)} value={this.state.ShortA} maxLength={16}
                hint="Коротке позначення лексеми А, яке відображатиметься на кнопках для голосування. Його потрібно писати з малої літери і без наголосів. Максимальна довжина – 16 символів. Наприклад: «вірно»." />
              <TextInput className={classnames(s.textInput, s.grid42, this.state.validatorShortB)} placeholder="Лексема Б коротко, наприклад: правильно"
                onSave={this.updateShortB.bind(this)} value={this.state.ShortB} maxLength={16}
                hint="Коротке позначення лексеми Б, яке відображатиметься на кнопках для голосування. Його потрібно писати з малої літери і без наголосів. Максимальна довжина – 16 символів. Наприклад: «правильно»." />
            </div>
            <div className={classnames(s.contentEditor, this.state.validatorContent)}>
              <QuillWrapper value={this.state.Content} onChange={this.onContentChanged.bind(this)} />
            </div>
            <div className={s.buttonsContainer}>
              <BlueButton onClick={this.onSave.bind(this)}>Зберегти</BlueButton>
              <BlueButton onClick={this.onCancel.bind(this)}>Повернутися</BlueButton>
              <UserContext.Consumer>
                {context => this.props.data && this.props.data._id && checkPrivilege(context.user, USER_LEVEL_ADMIN) ? (
                  <BlueButton onClick={this.onDelete.bind(this)}>Видалити статтю</BlueButton>
                ) : ""}
              </UserContext.Consumer>
              <Popup modal open={this.state.assertDelete} onClose={this.onCancelDeletion.bind(this)}>
                <div className={s.modalContainer}>
                  <span className={s.modalText}>Ви точно бажаєте видалити цю статтю?</span>
                  <div className={s.modalButtons}>
                    <BlueButton onClick={this.onDeleteDo.bind(this)}>Так</BlueButton>
                    <BlueButton onClick={this.onCancelDeletion.bind(this)}>Ні</BlueButton>
                  </div>
                </div>
              </Popup>
            </div>
          </div>
      );
  }
}

export default withEverything(EditArticle, s, [ { condition: q => q.id === 'new', value: null }, '/api/getArticle/:id' ]);

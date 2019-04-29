import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ProposeArticle.css';
import classnames from 'classnames';
import { UserContext } from '../../UserContext';
import TextInput from '../../components/TextInput/TextInput';
import history from '../../history';
import { guid, quillToolbarOptions, htmlNonEmpty, showSticky, goToLink } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import QuillWrapper from '../../components/QuillWrapper/QuillWrapper';

class ProposeArticle extends React.Component {
  static propTypes = {};

  state = {
    Content: '',
  };

  constructor(props)
  {
    super(props);
    this.state.Content = "<p></p>";
  }

    updateContent(value) { this.setState({Content:value}); }


    onContentChanged(content)
    {
        this.setState({ Content: content, contentValidator: null });
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

        var proposal = { Content: this.state.Content };
        var text = JSON.stringify(proposal);

        var res = await this.props.context.fetch('/api/propose', {method:'POST', body: text, headers: { "Content-Type": "application/json" }});
        var resj = await res.json();
        if (resj.success)
        {
            showSticky(this, "Вашу пропозицію прийнято до розгляду!");
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
          <div className={s.container}>
            <Helmet>
              <title>Запропонувати статтю</title>
            </Helmet>
            <div className={s.editGrid}>
                <span>Напишіть нам, на яку тему ви б хотіли побачити статтю на нашому сайті.</span>
            </div>
            <div className={classnames(s.contentEditor, this.state.contentValidator)}>
              <QuillWrapper value={this.state.Content} onChange={this.onContentChanged.bind(this)} />
            </div>
            <div className={s.buttonsContainer}>
              <BlueButton onClick={this.onSave.bind(this)}>Надіслати</BlueButton>
            </div>
          </div>
      );
  }
}

export default withEverything(ProposeArticle, s);

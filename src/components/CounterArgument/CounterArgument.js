import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './CounterArgument.css';
import { checkPrivilege, USER_LEVEL_MODERATOR, isValidArgument, USER_LEVEL_MEMBER } from '../../utility';
import { Link } from 'react-router-dom';
import FormattedText from '../../components/FormattedText/FormattedText';
import Popup from "reactjs-popup";

class CounterArgument extends React.Component
{
    static propTypes = {};

    constructor(props)
    {
        super(props);
    }

    render()
    {
        let counters = this.props.argument.Counters || [];
        let validity = isValidArgument(this.props.argument);
        return (
                <>
                    <div className={cx(s.argumentHeader, validity ? null : s.argumentHeaderInvalid)}>
                        <span className={s.argumentTitle}>Контраргумент</span>
                        {checkPrivilege(this.props.user, USER_LEVEL_MEMBER) ? (
                            <span className={s.argueButton}>
                                <Popup on='hover' contentStyle={{"width":"300px","borderRadius":"5px","textAlign":"center"}} trigger={
                                    <Link to={"/editCounterArgument/" + this.props.rootId + "/" + this.props.idChain.join('.') + ".new"}>
                                        <img className={s.argumentEditButton} src="/images/argue.png" />
                                    </Link>
                                }>
                                    <span>Посперечатися з цим контраргументом</span>
                                </Popup>                            
                            </span>
                        ) : ""}
                        {checkPrivilege(this.props.user, USER_LEVEL_MODERATOR) ? (
                            <Link to={"/editCounterArgument/" + this.props.rootId + "/" + this.props.idChain.join('.')}>
                                <img className={s.argumentEditButton} src="/images/edit.png" />
                            </Link>
                        ) : ""}
                    </div>
                    <div className={cx(s.argumentBody, validity ? null : s.argumentBodyInvalid)}>
                        <FormattedText html={this.props.argument.Content} />
                    </div>
                    {counters.map(counter =>
                            <div key={counter._id} className={s.childCounter}>
                                <CounterArgument argument={counter} user={this.props.user}
                                    idChain={this.props.idChain.concat(counter._id)} rootId={this.props.rootId} />
                            </div>
                        )}
                </>
        );
    }
}

export default withStyles(s)(CounterArgument);
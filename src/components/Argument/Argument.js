import React from 'react';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Argument.css';
import { checkPrivilege, USER_LEVEL_MODERATOR, isValidArgument, USER_LEVEL_MEMBER } from '../../utility';
import { Link } from 'react-router-dom';
import FormattedText from '../../components/FormattedText/FormattedText';
import CounterArgument from '../CounterArgument/CounterArgument';
import Popup from "reactjs-popup";

class Argument extends React.Component
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
                <div>
                    <div className={cx(s.argumentHeader, validity ? null : s.argumentHeaderInvalid)}>
                        <span className={s.argumentTitle}>{this.props.priority.priority.Title}</span>
                        <span className={s.argumentVote}>{this.props.argument.voteFor}</span>
                        {checkPrivilege(this.props.user, USER_LEVEL_MEMBER) ? (
                            <span className={s.argueButton}>
                                <Popup on='hover' contentStyle={{"width":"300px","borderRadius":"5px","textAlign":"center"}} trigger={
                                    <Link to={"/editCounterArgument/" + this.props.argument._id + "/new"}>
                                        <img className={s.argumentEditButton} src="/images/argue.png" />
                                    </Link>
                                }>
                                    <span>Посперечатися з цим аргументом</span>
                                </Popup>                            
                            </span>
                        ) : ""}
                        {checkPrivilege(this.props.user, USER_LEVEL_MODERATOR) ? (
                            <Link to={"/editArgument/" + this.props.argument._id}>
                                <img className={s.argumentEditButton} src="/images/edit.png" />
                            </Link>
                        ) : ""}
                    </div>
                    <div className={cx(s.argumentBody, validity ? null : s.argumentBodyInvalid)}>
                        <FormattedText html={this.props.argument.Content} />
                    </div>
                    {counters.map(counter =>
                        <div key={counter._id} className={s.childCounter}>
                            <CounterArgument argument={counter} user={this.props.user} idChain={[counter._id]} rootId={this.props.argument._id} />
                        </div>
                    )}
                </div>
        );
    }
}

export default withStyles(s)(Argument);
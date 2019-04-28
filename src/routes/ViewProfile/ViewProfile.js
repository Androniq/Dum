import React from 'react';
import PropTypes from 'prop-types';
import s from './ViewProfile.css';
import cx from 'classnames';
import { Helmet } from 'react-helmet';
import withEverything from '../../withEverything';
import { DEFAULT_USERPIC, userRoleToLocal, checkPrivilege, USER_LEVEL_ADMIN, USER_LEVEL_MEMBER, USER_LEVEL_MODERATOR, showSticky } from '../../utility';
import BlueButton from '../../components/BlueButton/BlueButton';

class ViewProfile extends React.Component
{
    userRolePanel(role)
    {
        switch (role)
        {
            case 'visitor': return (
                <span>Гість</span>
            );
            case 'member': return (
                <span>Учасник</span>
            );
            case 'moderator': return (
                <span>Модератор</span>
            );
            case 'admin': return (
                <span>Адміністратор</span>
            );
            case 'owner': return (
                <span>Власник сайту</span>
            );
        }
        return null;
    }

    async alterLevel(newLevel)
    {
        var requestBody = { id: this.props.data.viewedUser._id, level: newLevel };
        var resp = await this.props.context.fetch('/api/setRole', { method: 'POST', body: JSON.stringify(requestBody),
            headers: { "Content-Type": "application/json" }});
        var rj = await resp.json();
        if (rj.success)
        {
            showSticky(this, 'Роль користувача змінено');
            if (!process.env.IS_SERVER)
            {
                window.location.reload();
            }
        }
    }

    async makeMember()
    {
        await this.alterLevel(USER_LEVEL_MEMBER);
    }

    async makeModerator()
    {        
        await this.alterLevel(USER_LEVEL_MODERATOR);
    }

    async makeAdmin()
    {        
        await this.alterLevel(USER_LEVEL_ADMIN);
    }

    render()
    {
        var viewed = this.props.data.viewedUser;
        return (
            <div className="container">
                <Helmet>
                    <title>{viewed.displayName}</title>
                </Helmet>
                <div className={s.topRow}>
                    <img className={s.userpic} src={viewed.photo || DEFAULT_USERPIC} />
                    <div className={s.userCard}>
                        <span className={s.displayName}>{viewed.displayName}</span>
                        {this.userRolePanel(viewed.role)}
                    </div>
                </div>
                {checkPrivilege(this.props.data.user, USER_LEVEL_ADMIN)
                && viewed._id !== this.props.data.user._id
                && viewed.role !== "owner" ? (
                    <div className={s.adminControls}>
                        {viewed.role !== 'member' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeMember.bind(this)}>Зробити учасником</BlueButton>
                        ) : null}
                        {viewed.role !== 'moderator' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeModerator.bind(this)}>Зробити модератором</BlueButton>
                        ) : null}
                        {viewed.role !== 'admin' ? (
                            <BlueButton className={s.adminButton} onClick={this.makeAdmin.bind(this)}>Зробити адміністратором</BlueButton>
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
}

export default withEverything(ViewProfile, s, '/api/getProfile/:id');

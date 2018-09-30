import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    mongoDelete } from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';

export default async function getAccount(user)
{
    if (!user)
    {
        return { status: 403, message: "Error: you are not logged in" };
    }
    var unreadNotifCount = await mongoAsync.dbCollections.notifications.countDocuments({ to: user._id, unread: true });
    var proposals = await mongoAsync.dbCollections.proposedArguments.find({ owner: user._id }).toArray();
    var data =
    {
        unreadNotifCount,
        proposals,
        googleProfile: user.googleProfile,
        facebookProfile: user.facebookProfile
    };
    return data;
}
import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate } from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
	USER_LEVEL_OWNER, 
    guid } from '../utility';

export async function setMe(user, setters)
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "You must be logged in and have confirmed email address to alter your profile" };
    }
    var projection = { _id: user._id, displayName: setters.displayName };
    await mongoUpdate(mongoAsync.dbCollections.users, projection);
    return { success: true };
}
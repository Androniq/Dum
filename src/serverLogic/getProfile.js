import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate, 
    mongoFind} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';
    
export default async function getProfile(user, { id })
{
	if (!checkPrivilege(user, USER_LEVEL_ADMIN))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var viewedUser = await mongoFind(mongoAsync.dbCollections.users, id,
        { projection: { "displayName": 1, "photo": 1, "role": 1, "confirmed": 1, "blocked": 1 } });

    if (!viewedUser)
    {
        return { status: 404, message: "User with requested ID not found" };
    }

    var history = await mongoAsync.dbCollections.history.find({ User: id }).toArray();

    var data = { viewedUser, history };

    return data;
}
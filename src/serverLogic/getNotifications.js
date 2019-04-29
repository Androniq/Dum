import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    mongoDelete, 
    mongoFind} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';

export default async function getNotifications(user)
{
    if (!user)
    {
        return { status: 401, message: "Error: you are not logged in" };
    }
    var notifications = await mongoAsync.dbCollections.notifications.find({ to: user._id }).toArray();
    var userIds = [...new Set(notifications.map(it => it.from))];    
    var users = await mongoFind(mongoAsync.dbCollections.users, userIds, { "photo": 1, "displayName": 1 });
    var resp = 
    {
        notifications,
        users
    };
    return resp;
}
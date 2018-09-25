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
    
export default async function deleteArgument(user, id)
{
	if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { success: false, message: "Insufficient privileges" };
	}
    await mongoDelete(mongoAsync.dbCollections.arguments, id);
	return { success: true };
}
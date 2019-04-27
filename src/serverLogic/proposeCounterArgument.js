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
    USER_LEVEL_OWNER } from '../utility';
    
export default async function proposeCounterArgument(user, arg)
{
	if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Insufficient privileges" };
    }
    
    if (arg._id)
        delete arg._id;

    await mongoInsert(mongoAsync.dbCollections.proposedArguments, arg, user);

	return { success: true };
}
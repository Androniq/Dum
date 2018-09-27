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
    
export default async function setArgument(user, arg)
{
	if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Insufficient privileges" };
	}
	
	var isProposal = !checkPrivilege(user, USER_LEVEL_MODERATOR);
	var isNew = !arg._id;

	if (isProposal && !isNew)
	{
        return { status: 403, message: "Insufficient privileges" };
	}

	if (!isNew)
	{
		await mongoUpdate(mongoAsync.dbCollections.arguments, arg, user);
	}
	else if (isProposal)
	{
		await mongoInsert(mongoAsync.dbCollections.proposedArguments, arg, user);
	}
	else
	{
		await mongoInsert(mongoAsync.dbCollections.arguments, arg, user);
	}
	return { success: true };
}
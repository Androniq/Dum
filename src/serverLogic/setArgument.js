import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate, 
	mongoFind,
	writeHistory,
	getDifference} from './_common';

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
		var oldArg = await mongoFind(mongoAsync.dbCollections.arguments, arg._id);
		if (!oldArg)
		{
			return { status: 404, message: "Argument not found" };
		}
		await mongoUpdate(mongoAsync.dbCollections.arguments, arg, user);
		await writeHistory(user, arg.Article, "UpdateArgument", getDifference(oldArg, arg));
	}
	else if (isProposal)
	{
		var r = await mongoInsert(mongoAsync.dbCollections.proposedArguments, arg, user);
		await writeHistory(user, arg.Article, "ProposeArgument", r.insertedId);
	}
	else
	{
		var r = await mongoInsert(mongoAsync.dbCollections.arguments, arg, user);
		await writeHistory(user, arg.Article, "CreateArgument", r.insertedId);
	}
	return { success: true };
}
import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    mongoDelete, 
    mongoFind,
    writeHistory} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';
    
export default async function deleteArgument(user, { id })
{
	if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { status: 403, message: "Insufficient privileges" };
    }
    var arg = await mongoFind(mongoAsync.dbCollections.arguments, id);
    if (!arg)
    {
        return { status: 404, message: "Argument not found" };
    }
    await mongoDelete(mongoAsync.dbCollections.arguments, id);
    await writeHistory(user, arg.Article, "DeleteArgument", arg);
	return { success: true };
}
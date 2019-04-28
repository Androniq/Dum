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
    
function levelToRole(level)
{
    switch (level)
    {
        case USER_LEVEL_VISITOR: return "visitor";
        case USER_LEVEL_MEMBER: return "member";
        case USER_LEVEL_MODERATOR: return "moderator";
        case USER_LEVEL_ADMIN: return "admin";
        case USER_LEVEL_OWNER: return "owner";
    }
    throw "Wrong level";
}

export default async function setRole(user, { id, level })
{
	if (!checkPrivilege(user, USER_LEVEL_ADMIN))
    {
        return { status: 403, message: "Only administrators can alter roles" };
    }
    
    if (user._id.toString() === id)
    {
        return { status: 422, message: "Cannot alter own role" };
    }

    if (level !== USER_LEVEL_MEMBER && level !== USER_LEVEL_MODERATOR && level !== USER_LEVEL_ADMIN)
    {
        return { status: 400, message: "Wrong role code" };
    }

    var user = await mongoFind(mongoAsync.dbCollections.users, id);
    if (!user)
    {
        return { status: 404, message: "User not found" };
    }

    if (user.role === 'owner')
    {
        return { status: 422, message: "Cannot alter the site owner's role" };
    }
    if (user.role === 'visitor')
    {
        return { status: 422, message: "User has to confirm email address first" };
    }

    user.role = levelToRole(level);
    
    await mongoUpdate(mongoAsync.dbCollections.users, user);
    
    return { success: true };
}
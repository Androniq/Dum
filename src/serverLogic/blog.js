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

    export async function getBlogByUrl(user, { blogUrl })
    {
        var blog = await mongoAsync.dbCollections.blog.findOne({ Url: blogUrl });
        if (!blog)
            return { status: 404, localMessage: 'Нема такого запису в блоґах' };            
        var owner = await mongoFind(mongoAsync.dbCollections.users, blog.Owner, { "displayName": 1, "photo": 1 });
        if (!owner)
        {
            owner = await mongoAsync.dbCollections.users.findOne({}, { "displayName": 1, "photo": 1 })
                || { displayName: "ТОЙ-КОГО-НЕ-МОЖНА-НАЗИВАТИ" };
        }
        blog.Owner = owner;
        return blog;
    }
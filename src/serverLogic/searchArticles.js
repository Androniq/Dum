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

export default async function searchArticles(user, params, query)
{
    var q = query && query.q;
    if (!q)
    {
        return { success: true, articles: [] };
    }
    var regex = new RegExp('.*'+q.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')+'.*');
    var list = await mongoAsync.dbCollections.articles.find({ Keywords: regex },
        { projection: { "PageTitle": 1, "Url": 1, "_id": 0 }}).toArray();
    return { success: true, articles: list };
}
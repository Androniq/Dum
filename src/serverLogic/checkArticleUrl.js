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

import { ObjectID } from 'mongodb';

export default async function checkArticleUrl(url, id)
{
    if (url === 'new') // reserved
        return { success: false };
    var filter = { Url: url };
    if (id && id !== 'null')
        filter._id = { $ne: new ObjectID(id) };
    var count = await mongoAsync.dbCollections.articles.countDocuments(filter);
    return { success: count === 0 };
}
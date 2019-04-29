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

export default async function getArticles()
{
    var list = await mongoAsync.dbCollections.articles.find({}, { projection: { "PageTitle": 1, "Url": 1, "_id": 0 }}).toArray();
    return { articles: list };
}
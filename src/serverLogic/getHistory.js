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

export default async function getHistory(user, { id })
{
	if (!checkPrivilege(user, USER_LEVEL_ADMIN))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var history = await mongoAsync.dbCollections.history.find({ Article: id }).sort({ Time: -1 }).toArray();    
    if (!history.length)
    {
        return { status: 404, message: "No records found" };
    }
    var article;
    var articleUrl;
    if (history[0].Action === "DeleteArticle")
    {
        article = history[0].Change.article;
    }
    else
    {
        article = await mongoFind(mongoAsync.dbCollections.articles, id);
        if (!article)
        {
            return { status: 404, message: "Missing records in the database" };
        }
        articleUrl = article.Url;
    }

    var userIds = [];
    history.forEach(it =>
        {
            if (!userIds.includes(it.User))
                userIds.push(it.User);
        });
    var users = await mongoFind(mongoAsync.dbCollections.users, userIds, { _id: 1, photo: 1, displayName: 1 });

    var data = { history, users, articleName: article.Title, articleUrl };

    return data;
}
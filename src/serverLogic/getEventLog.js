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

export default async function getEventLog(user)
{
	if (!checkPrivilege(user, USER_LEVEL_ADMIN))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var history = await mongoAsync.dbCollections.history.find({}).sort({ Time: -1 }).limit(100).toArray();
    var userIds = [];
    var articleIds = [];
    history.forEach(it =>
        {
            if (!userIds.includes(it.User))
                userIds.push(it.User);
            if (!articleIds.includes(it.Article))
                articleIds.push(it.Article);
        });
    var users = await mongoFind(mongoAsync.dbCollections.users, userIds, { _id: 1, photo: 1, displayName: 1 });
    var articles = await mongoFind(mongoAsync.dbCollections.articles, articleIds, { _id: 1, Title: 1 });
    articleIds = articleIds.filter(it => !articles.some(art => art._id.toString() === it));
    if (articleIds.length)
    {
        var deletedArticles = await mongoAsync.dbCollections.history.find({ Action: "DeleteArticle",
            Article: { $in: articleIds } }).toArray();
        deletedArticles.forEach(it =>
            {
                articles.push({ _id: it.Article, Title: it.Change.article.Title });
            });
    }
    
    var data = { history, users, articles };

    return data;
}
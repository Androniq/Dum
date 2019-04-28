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
 
export async function getChange(user, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var item = await mongoFind(mongoAsync.dbCollections.history, id);
    if (!item)
    {
        return { status: 404, message: "History record not found" };
    }

    var theUser = await mongoFind(mongoAsync.dbCollections.users, item.User);
    var article = await mongoFind(mongoAsync.dbCollections.articles, item.Article);
    var articleExists = true;
    var articleDeleted = null;
    if (!article)
    {
        articleExists = false;
        var deleteRecord =
            item.Action === "DeleteArticle" ? item :
            await mongoAsync.dbCollections.history.findOne({ Action: "DeleteArticle", Article: item.Article });
        article = deleteRecord.Change.article;
        articleDeleted = deleteRecord.Time;
    }

    return {
        theUser,
        articleName: article.Title,
        articleId: item.Article,
        articleUrl: article.Url,
        articleExists,
        articleDeleted,
        Time: item.Time,
        Change: item.Change,
        Action: item.Action
    };
}
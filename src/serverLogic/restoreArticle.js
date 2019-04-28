import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate, 
    mongoDelete,
    writeHistory,
    mongoFind} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
	USER_LEVEL_OWNER, 
    softId} from '../utility';
import checkArticleUrl from './checkArticleUrl';

export default async function restoreArticle(user, body, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_ADMIN))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var record = await mongoAsync.dbCollections.history.findOne({ Article: id, Action: "DeleteArticle" });
    if (!record)
    {
        return { status: 403, message: "Record not found" };
    }

    var article = record.Change.article;
    var args = record.Change.arguments;

    if (!await checkArticleUrl(user, { url: article.Url, id: article._id }))
    {
        article.Url += "_" + softId();
    }

    await mongoInsert(mongoAsync.dbCollections.articles, article);    
    
    await Promise.all(args.map(it => mongoInsert(mongoAsync.dbCollections.arguments, it)));

    await mongoDelete(mongoAsync.dbCollections.history, record._id);
    
    return { success: true, articleUrl: article.Url };
}
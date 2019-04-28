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
	USER_LEVEL_OWNER, 
    guid } from '../utility';
import checkArticleUrl from './checkArticleUrl';

export default async function setArticle(user, article)
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { status: 403, message: "Insufficient privileges" };
    }
    var check = await checkArticleUrl(user, { url: article.Url, id: article._id });
    if (!check.success)
    {
        return { status: 406, message: "Article name non-unique (check first with checkArticleUrl API)" };
    }
    var projectedArticle =
    {
        _id: article._id,
        Content: article.Content,
        Title: article.Title,
        PageTitle: article.PageTitle,
        Keywords: article.Keywords,
        Url: article.Url,
        TokenA: article.TokenA.replace('*', '\u0301'),
        TokenB: article.TokenB.replace('*', '\u0301'),
        ShortA: article.ShortA,
        ShortB: article.ShortB,
        CreatedDate: article.CreatedDate,
        UpdatedDate: article.UpdatedDate,
        Owner: article.Owner
    };    
    if (article._id)
    {
        var upd = await mongoUpdate(mongoAsync.dbCollections.articles, projectedArticle, user);
        if (upd.matchedCount < 1)
        {
            return { status: 404, message: "Did not find article with ID " + article._id };
        }
    }
    else
    {
        await mongoInsert(mongoAsync.dbCollections.articles, projectedArticle, user);
    }
    return { success: true };
}
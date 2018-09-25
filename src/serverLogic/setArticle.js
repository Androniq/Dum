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

export default async function setArticle(user, article)
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { success: false, message: "Insufficient privileges" };
    }
    var projectedArticle =
    {
        _id: article._id,
        ID: article.ID,
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
            return { success: false, message: "Did not find article with ID " + article._id };
        }
    }
    else
    {
        projectedArticle.ID = guid();
        await mongoInsert(mongoAsync.dbCollections.articles, projectedArticle, user);
    }
    return { success: true };
}
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
    
export async function getArgument(user, id)
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { success: false, message: "Insufficient privileges" };
    }

    var arg = await mongoAsync.dbCollections.arguments.findOne({ _id: new ObjectID(id) });
    var article = await mongoAsync.dbCollections.articles.findOne({ ID: arg.Article });
    var votes = mongoAsync.preloads.votes;
    var priorities = mongoAsync.preloads.priorities;
    votes.forEach(vote =>
    {
        vote.ShortDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
    });
    var res = { argument: arg, article, votes, priorities };
    return res;
}

export async function getNewArgument(user, url)
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { success: false, message: "Insufficient privileges" };
    }

    var isProposal = !checkPrivilege(user, USER_LEVEL_MODERATOR);
    var article = await mongoAsync.dbCollections.articles.findOne({ Url: url });
    if (!article)
    {
        return { success: false, message: "Article not found" };
    }
    var votes = mongoAsync.preloads.votes;
    var priorities = mongoAsync.preloads.priorities;
    votes.forEach(vote =>
    {
        vote.ShortDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
    });
    var res = { argument: { Article: article.ID }, article, votes, priorities, isProposal };
    return res;
}
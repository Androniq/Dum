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

import { ObjectID } from 'mongodb';
    
export async function getArgument(user, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Insufficient privileges" };
    }
    var type = "edit";
    var isProposal = false;
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        type = "proposal";
        isProposal = true;
    }
    
    var arg = await mongoFind(mongoAsync.dbCollections.arguments, id);    
    var article = await mongoFind(mongoAsync.dbCollections.articles, arg.Article);
    var votes = mongoAsync.preloads.votes;
    var priorities = mongoAsync.preloads.priorities;
    votes.forEach(vote =>
    {
        vote.ShortDescription = vote.ShortDescriptionTemplate.replace('%A%', article.ShortA).replace('%B%', article.ShortB);
    });
    var res = { argument: arg, article, votes, priorities, type, isProposal };
    return res;
}

export async function getNewArgument(user, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var isProposal = !checkPrivilege(user, USER_LEVEL_MODERATOR);
    var article = await mongoAsync.dbCollections.articles.findOne({ Url: id });
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
    var res = { argument: { Article: article._id }, article, votes, priorities, isProposal, type: isProposal ? "proposal" : "new" };
    return res;
}
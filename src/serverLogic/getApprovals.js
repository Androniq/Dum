import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    mongoDelete, 
    mongoFind} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER } from '../utility';

const ObjectID = require('mongodb').ObjectID;

export default async function getApprovals(user)
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { status: 403, message: "Need moderator rights to see approvals list" };
    }
    var proposedArgs = await mongoAsync.dbCollections.proposedArguments.find().toArray();
    var articleIds = [];
    var userIds = [];
    var contestedArgIds = [];
    proposedArgs.forEach(proposedArg =>
        {
            if (!articleIds.some(item => item === proposedArg.Article))
            {
                articleIds.push(proposedArg.Article);
            }
            if (!userIds.some(item => item === proposedArg.Owner))
            {
                userIds.push(proposedArg.Owner);
            }
            if (proposedArg.RootId)
            {
                if (!contestedArgIds.some(item => item === proposedArg.RootId))
                    contestedArgIds.push(proposedArg.RootId);
            }
        });    
    var articles = await mongoFind(mongoAsync.dbCollections.articles, articleIds);
    console.info(articleIds);
    var contestedArgs = await mongoFind(mongoAsync.dbCollections.arguments, contestedArgIds);
    articles.forEach(article => {
        article.Content = null;
    });    
    var users = await mongoFind(mongoAsync.dbCollections.users, userIds, { projection: { "photo": 1, "displayName": 1 } });
    var votes = mongoAsync.preloads.votes;
    var priorities = mongoAsync.preloads.priorities;
    votes.forEach(vote =>
    {
        vote.ShortDescription = null;
    });
    var data =
    {
        proposedArgs,
        articles,
        votes,
        priorities,
        users,
        contestedArgs
    };
    return data;
}
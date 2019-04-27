import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    mongoDelete } from './_common';

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
    var articles = await mongoAsync.dbCollections.articles.find({ ID: { $in: articleIds }}).toArray();
    var contestedArgs = await mongoAsync.dbCollections.arguments.find({ _id: { $in: contestedArgIds.map(it => new ObjectID(it)) }}).toArray();
    articles.forEach(article => {
        article.Content = null;
    });
    var users = await mongoAsync.dbCollections.users.find({ _id: { $in: userIds.map(it => new ObjectID(it)) }},
        { projection: { "photo": 1, "displayName": 1 } }).toArray();
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
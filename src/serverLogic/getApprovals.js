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
    var userIds2 = [];
    proposedArgs.forEach(proposedArg =>
        {
            if (!articleIds.some(item => item === proposedArg.Article))
            {
                articleIds.push(proposedArg.Article);
            }
            if (!userIds.some(item => item === proposedArg.Owner))
            {
                userIds.push(proposedArg.Owner);
                userIds2.push(new ObjectID(proposedArg.Owner));
            }
        });
    var articles = await mongoAsync.dbCollections.articles.find({ ID: { $in: articleIds }}).toArray();
    articles.forEach(article => {
        article.Content = null;
    });
    var users = await mongoAsync.dbCollections.users.find({ _id: { $in: userIds2 }},
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
        users
    };
    return data;
}
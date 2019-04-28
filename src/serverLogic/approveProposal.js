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
	USER_LEVEL_OWNER, 
    guid } from '../utility';
import checkArticleUrl from './checkArticleUrl';
const ObjectID = require('mongodb').ObjectID;

export default async function approveProposal(user, body, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var proposal = await mongoFind(mongoAsync.dbCollections.proposedArguments, id);
    if (!proposal)
    {
        return { status: 404, message: "Proposal with provided ID not found" };
    }

    if (proposal.RootId)
    {
        var rootArgument = await mongoFind(mongoAsync.dbCollections.arguments, proposal.RootId);
        var current = rootArgument;
        for (let index = 0; index < proposal.IdChain.length; index++)
        {
            current = current.Counters.find(it => it._id.toString() === proposal.IdChain[index]);
        }

        if (!current.Counters)
            current.Counters = [];
        current.Counters.push({
            _id: guid(),
            Content: proposal.Content,
            Owner: proposal.Owner
        });

        var t = await mongoUpdate(mongoAsync.dbCollections.arguments, rootArgument, null);
        if (t && t.result && t.result.ok)
        {
            await mongoDelete(mongoAsync.dbCollections.proposedArguments, id);

            return { success: true };
        }
        return { status: 500, message: "Database error" };
    }

    var argument = {
        Vote: proposal.Vote,
        Content: proposal.Content,
        Priority: proposal.Priority,
        Owner: proposal.Owner,
        Article: proposal.Article,
        Approver: user._id
    };

    var t = await mongoInsert(mongoAsync.dbCollections.arguments, argument, null);
    if (t && t.result && t.result.ok)
    {
        await mongoDelete(mongoAsync.dbCollections.proposedArguments, id);

        return { success: true };
    }
    return { status: 500, message: "Database error" };
}
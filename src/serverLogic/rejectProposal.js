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
    guid } from '../utility';
import checkArticleUrl from './checkArticleUrl';
const ObjectID = require('mongodb').ObjectID;

export default async function rejectProposal(user, { id })
{
    if (!checkPrivilege(user, USER_LEVEL_MODERATOR))
    {
        return { status: 403, message: "Insufficient privileges" };
    }

    var proposal = await mongoFind(mongoAsync.dbCollections.proposedArguments, id);
    if (!proposal)
    {
        return { status: 404, message: "Proposal not found" };
    }

    await mongoDelete(mongoAsync.dbCollections.proposedArguments, id);
    await writeHistory(user, proposal.Article, "RejectProposal", proposal);

    return { success: true };
}
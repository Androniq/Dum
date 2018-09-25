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

async function deleteAllVotes(userId, articleId)
{
	await mongoAsync.dbCollections.popularVote.deleteMany({ User: userId, Article: articleId });
}

export default async function sendPopularVote(user, articleId, voteId)
{
	if (!user)
	{
		return { success: false, message: 'Error: not logged in' };
	}

	if (!checkPrivilege(user, USER_LEVEL_MEMBER))
	{
		return { success: false, message: 'Error: not enough privileges (either email not confirmed or user banned)' };
	}

	var res = await mongoAsync.dbCollections.popularVote.find({ Article: articleId, User: user._id }).toArray();

	if (!voteId || voteId === 'null')
	{
		await deleteAllVotes(user._id, articleId);
		return { success: true, message: 'Success (vote undone)' };
	}

	var additionalMessage = 'vote added';
	var totalCount = res.length;
	if (totalCount > 1) // unexpected situation: more than single vote from current user on this article!
	{
		additionalMessage = 'suspicious: multiple votes detected and removed';
		await deleteAllVotes(user._id, articleId); // purge all its votes before proceeding
		totalCount = 0;
	}
	if (totalCount === 1) // there is exactly one vote: just update it
	{
		additionalMessage = 'vote updated';
		var vote = res[0];
		vote.Vote = voteId;
		await mongoUpdate(mongoAsync.dbCollections.popularVote, vote);
	}
	else // there are no votes: create a new one
	{
		var newVote = { User: user._id, Vote: voteId, Article: articleId, Active: true };
		await mongoInsert(mongoAsync.dbCollections.popularVote, newVote);
	}
	return { success: true, message: 'Success (' + additionalMessage + ')' };
}
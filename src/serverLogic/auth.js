import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate,
    setServerConfig } from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
	USER_LEVEL_OWNER } from '../utility';

// Authentication

export async function findOrCreateUser(token, type, profile)
{
	var user;
	switch(type)
	{
		case "google":
			user = await mongoAsync.dbCollections.users.findOne({ "googleId" : token });
			break;
		case "facebook":
			user = await mongoAsync.dbCollections.users.findOne({ "facebookId" : token });
			break;
		case "local":
			user = await mongoAsync.dbCollections.users.findOne({ "email" : token });
			break;
		default:
			throw "Wrong user auth type: " + type + " (should be google, facebook or local)";
	}
	if (user) { return user; }
	let newUser;
	var noOwner = !mongoAsync.serverConfig.owner;
	switch(type)
	{
		case "google":
			newUser = { googleId : token, googleProfile : profile, role: "member", confirmed: true, blocked: false };
			if (profile.emails)
			{
				profile.emails.forEach(email =>
				{
					if (email.type === 'account')
						newUser.email = email.value;
				});
			}
			if (profile.photos)
			{
				newUser.photo = profile.photos[0].value;
			}
			if (profile.displayName)
			{
				newUser.displayName = profile.displayName;
			}
			else if (profile.name)
			{
				newUser.displayName = "";
				if (profile.name.givenName)
					newUser.displayName += profile.name.givenName;
				if (profile.name.givenName && profile.name.familyName)
					newUser.displayName += " ";
				if (profile.name.familyName)
					newUser.displayName += profile.name.familyName;
			}
			if (noOwner) newUser.role = 'owner';
			user = (await mongoInsert(mongoAsync.dbCollections.users, newUser)).ops[0];
			break;
		case "facebook":
			newUser = { facebookId : token, facebookProfile : profile, role: "member", confirmed: true, blocked: false };
			if (profile.emails)
			{
				profile.emails.forEach(email =>
				{
					if (email.type === 'account')
						newUser.email = email.value;
				});
			}
			if (profile.photos)
			{
				newUser.photo = profile.photos[0].value;
			}
			if (profile.displayName)
			{
				newUser.displayName = profile.displayName;
			}
			else if (profile.name)
			{
				newUser.displayName = "";
				if (profile.name.givenName)
					newUser.displayName += profile.name.givenName;
				if (profile.name.givenName && profile.name.familyName)
					newUser.displayName += " ";
				if (profile.name.familyName)
					newUser.displayName += profile.name.familyName;
			}
			if (noOwner) newUser.role = 'owner';
			user = (await mongoInsert(mongoAsync.dbCollections.users, newUser)).ops[0];
			break;
		case "local":
			// TODO: read fields from profile
			break;
	}
	if (noOwner)
	{
		await setServerConfig({ owner: user._id });
	}
  return user;
}

export async function setUserRole(operatorUser, operandUserId, newRole)
{
	if (!checkPrivilege(operatorUser, USER_LEVEL_ADMIN))
	{
		return { success: false, message: 'Insufficient privileges' };
	}
	var operandUser = await mongoAsync.users.findOne({ _id: operandUserId });
	if (!operandUser)
	{
		return { success: false, message: 'User not found' };
	}
	if (operandUser.role === 'owner')
	{
		return { success: false, message: 'You cannot change the OWNER role (use transferOwnership instead)' };
	}
	switch (newRole)
	{
		case 'member':
		case USER_LEVEL_MEMBER:
			operandUser.role = 'member';
			break;
		case 'moderator':
		case USER_LEVEL_MODERATOR:
			operandUser.role = 'moderator';
			break;
		case 'admin':
		case USER_LEVEL_ADMIN:
			operandUser.role = 'admin';
			break;
		default:
			return { success: false, message: 'Unknown newRole: ' + newRole };
	}
	await mongoUpdate(mongoAsync.dbCollections.users, operandUser);
	return { success: true };
}

export async function transferOwnership(fromUser, toUserId)
{
	if (!checkPrivilege(fromUser, USER_LEVEL_OWNER))
	{
		return { success: false, message: 'Only site owner can transfer ownership' };
	}
	var toUser = await mongoAsync.users.findOne({ _id: toUserId });
	if (!toUser)
	{
		return { success: false, message: 'User not found' };
	}
	if (!toUser.confirmed)
	{
		return { success: false, message: 'Target user did not confirm email address' };
	}
	toUser.blocked = false;
	toUser.role = 'owner';
	fromUser.role = 'admin';
	
	var session = mongoAsync.client.startSession();
	session.startTransaction();
	await mongoUpdate(mongoAsync.dbCollections.users, fromUser);
	await mongoUpdate(mongoAsync.dbCollections.users, toUser);
	await session.commitTransaction();
	session.endSession();
	
	return { success: true };
}
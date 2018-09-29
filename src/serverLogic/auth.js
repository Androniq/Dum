import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate,
    setServerConfig, 
	mongoDelete} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
	USER_LEVEL_OWNER, 
	emailRegex,
	generateToken} from '../utility';

import sendMail from './sendMail';
const ObjectID = require('mongodb').ObjectID;

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
			if (profile.photo)
			{
				newUser.photo = profile.photo;
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
			if (profile.photo)
			{
				newUser.photo = profile.photo;
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

export async function findLocalUser(email, pwd, isNew)
{	
	if (!pwd || pwd.length < 1 || !email || email.length < 1)
		return null;
	var displayName = email;
	email = email.toLowerCase();
	var user;
	if (!isNew)
	{
		user = await mongoAsync.dbCollections.users.findOne({ email, password: pwd });
		return user;
	}
	var exist = await mongoAsync.dbCollections.users.countDocuments({ email });
	if (exist)
	{
		return null;
	}
	user = { email, displayName, password: pwd, passMask: "*".repeat(pwd.length), role: "member", confirmed: false, blocked: false };
	user = (await mongoInsert(mongoAsync.dbCollections.users, user)).ops[0];
	return user;
}

export async function setUserRole(operatorUser, { operandUserId = userId, newRole = role })
{
	if (!checkPrivilege(operatorUser, USER_LEVEL_ADMIN))
	{
		return { status: 403, message: 'Insufficient privileges' };
	}
	var operandUser = await mongoAsync.users.findOne({ _id: operandUserId });
	if (!operandUser)
	{
		return { status: 404, message: 'User not found' };
	}
	if (operandUser.role === 'owner')
	{
		return { success: 422 /* Unprocessable entity */, message: 'You cannot change the OWNER role (use transferOwnership instead)' };
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
			return { status: 406, message: 'Unknown role: ' + newRole };
	}
	await mongoUpdate(mongoAsync.dbCollections.users, operandUser);
	return { success: true };
}

export async function transferOwnership(fromUser, toUserId)
{
	if (!checkPrivilege(fromUser, USER_LEVEL_OWNER))
	{
		return { status: 403, message: 'Only site owner can transfer ownership' };
	}
	var toUser = await mongoAsync.users.findOne({ _id: toUserId });
	if (!toUser)
	{
		return { status: 404, message: 'User not found' };
	}
	if (!toUser.confirmed)
	{
		return { status: 422 /* Unprocessable entity */, message: 'Target user did not confirm email address' };
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

export async function startConfirm(user, params, { update })
{
	if (!update && user.confirmed)
		return { message: "User already confirmed" };
	if (update)
	{
		if (typeof update !== "string")
			return { status: 401, message: "Email must be a string" };
		update = update.toLowerCase();
		if (!emailRegex.test(update))
			return { status: 401, message: "Invalid email address" };
		if (await mongoAsync.dbCollections.users.countDocuments({ email: update }))
			return { message: "User with such email already registered", localMessage: "Користувач із такою адресою вже зареєстрований" };
	}
	var token = generateToken();
	var expires = new Date();
	expires.setDate(expires.getDate() + 14);
	await mongoInsert('emailConfirmations', { token, user: user._id, expires, type: update ? "update" : "new", email: update });
	await sendMail(user.email, 'Підтвердження email-адреси | ДУМ', `Шановний користувачу!
	
Ви отримали цього листа тому, що хтось (можливо, ви) вказав вашу адресу при реєстрації на сайті Демократична Українська Мова ${process.env.SITE_URL}.

Якщо це були ви – підтвердіть, будь ласка, свою адресу, перейшовши за посиланням: ${process.env.SITE_URL}confirm/${token}.

Якщо ж це були не ви – нічого робити не потрібно.

З повагою,
команда ДУМ`,
`<p>Шановний користувачу!</p>	
<p>Ви отримали цього листа тому, що хтось (можливо, ви) вказав вашу адресу при реєстрації на сайті Демократична Українська Мова ${process.env.SITE_URL}.</p>
<p>Якщо це були ви – підтвердіть, будь ласка, свою адресу, перейшовши за посиланням: ${process.env.SITE_URL}confirm/${token}.</p>
<p>Якщо ж це були не ви – нічого робити не потрібно.</p>
<p>З повагою,<br />
команда ДУМ</p>`);
	return { success: true };
}

export async function endConfirm(user, { token })
{
	var confirmation = await mongoAsync.dbCollections.emailConfirmations.findOne({ token });
	if (!confirmation || confirmation.expires < new Date())
	{
		return { message: "Wrong or expired confirmation token", localMessage: "Хибне або застаріле посилання для підтвердження електронної пошти" };
	}
	var user = await mongoAsync.dbCollections.users.findOne({ _id: new ObjectID(confirmation.user) });
	if (!user)
	{
		return { message: "User not found for this confirmation token", localMessage: "Користувача, який підтверджує свою електронну пошту, не знайдено в базі" };
	}
	if (confirmation.type === "new" && user.confirmed)
	{
		return { message: "User already confirmed", localMessage: "Ваша адреса вже підтверджена!" };
	}
	var updateDoc = { _id: user._id, confirmed: true };
	if (confirmation.type === "update")
	{
		updateDoc.email = confirmation.email;
	}
	await mongoUpdate('users', updateDoc);
	await mongoDelete('emailConfirmations', confirmation._id);
	return { success: true };
}
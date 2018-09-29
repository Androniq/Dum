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
	USER_LEVEL_OWNER, 
    guid } from '../utility';

export async function setMe(user, setters)
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "You must be logged in and have confirmed email address to alter your profile" };
    }
    var projection = { _id: user._id };
    if (setters.displayName)
    {
        projection.displayName = setters.displayName;
    }
    if (setters.photo)
    {
        projection.photo = setters.photo;
    }
    if (setters.password)
    {
        var oldpwd = setters.oldPassword;
        if (user.password !== oldpwd)
        {
            return { status: 402, message: "Old password wrong", localMessage: "Неправильний поточний пароль" };
        }
        if (!setters.password.length)
        {
            return { status: 406, message: "New password too short" };
        }
        projection.password = setters.password;
        projection.passMask = "*".repeat(setters.password.length);
    }
    await mongoUpdate(mongoAsync.dbCollections.users, projection);
    return { success: true };
}
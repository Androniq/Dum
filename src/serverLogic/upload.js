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
    guid, 
    generateToken,
    acceptedExtensions} from '../utility';

import fs from 'fs';

export async function upload(user, req, params, { ext })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Need to log in and confirm email before uploading avatar" };
    }
    if (!ext || !acceptedExtensions.includes(ext))
    {
        return { status: 406, message: "Wrong image extension" };
    }
    if (user.photo && user.photo.startsWith('/upload/'))
    {
        // delete the old userpic
        mongoAsync.fs.delete(user.photo.substring(8), err => { if (err) console.error(err); });
    }
    var name = generateToken() + '.' + ext;
    var path = '/upload/' + name;
    var stream = mongoAsync.fs.openUploadStreamWithId(name, name);
    await req.pipe(stream);
    await mongoUpdate('users', { _id: user._id, photo: path });
    return { success: true, path };
}
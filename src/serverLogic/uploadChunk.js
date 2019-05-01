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
import { currentUploads } from './uploadInit';

export async function uploadChunk(user, body, params, { uploadToken, chunkIndex })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Need to log in and confirm email before uploading files" };
    }
    var upload = currentUploads.find(it => it.uploadToken === uploadToken);
    if (!upload)
    {
        return { status: 404, message: "Chunk on non-existing upload" };
    }
    upload.chunks[chunkIndex].data = body;
    upload.chunks[chunkIndex].resolver();
    return { success: true };
}
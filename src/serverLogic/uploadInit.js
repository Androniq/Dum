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

export const currentUploads = [];

export async function uploadInit(user, req, params, { chunkSize, chunkNumber, totalSize, operation })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Need to log in and confirm email before uploading files" };
    }
    var uploadToken = generateToken();
    var upload = {
        uploadToken,
        chunkNumber,
        chunkSize,
        totalSize,
        operation,
        user,
        chunks: []
    };
    var awaiters = [];
    for (let index = 0; index < chunkNumber; index++)
    {
        var chunk = { data: null };
        var awaiter = new Promise((resolve, reject) =>
        {
            chunk.resolver = resolve;
        });
        chunks.push(chunk);
        awaiters.push(awaiter);
    }
    upload.complete = Promise.all(awaiters);
    upload.complete.then(() => finalize(upload));

    currentUploads.push(upload);
    return { success: true, uploadToken };
}

function finalize(upload)
{
    switch (upload.operation)
    {
        case "avatar":
        return;
    }
}
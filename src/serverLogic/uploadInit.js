import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate, 
    clearTempFolder} from './_common';

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
import { applyBackup } from './uploadBackup';

export const currentUploads = [];

export async function uploadInit(user, req, params, { chunkSize, chunkNumber, totalSize, operation, ext })
{
    if (!checkPrivilege(user, USER_LEVEL_MEMBER))
    {
        return { status: 403, message: "Need to log in and confirm email before uploading files" };
    }
    switch (operation)
    {
        case "avatar":
            if (!ext || !acceptedExtensions.includes(ext))
            {
                return { status: 400, message: "Wrong image extension" };
            }
            break;
        case "backup":
            if (!checkPrivilege(user, USER_LEVEL_OWNER))
            {
                return { status: 403, message: "Only site OWNER can upload a backup" };
            }
            if (ext !== 'zip')
            {
                return { status: 400, message: "Wrong archive extension" };
            }
            break;
        default:
            return { status: 400, message: "Wrong operation type, should be avatar or backup" };
    }

    var uploadToken = generateToken();
    var upload = {
        uploadToken,
        chunkNumber,
        chunkSize,
        totalSize,
        operation,
        user,
        ext,
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
        upload.chunks.push(chunk);
        awaiters.push(awaiter);
    }
    upload.complete = Promise.all(awaiters);
    upload.complete.then(() => finalize(upload));

    currentUploads.push(upload);
    return { success: true, uploadToken };
}

async function finalize(upload)
{
    var totalLength = 0;
    upload.chunks.forEach(it =>
        {
            console.info(it.data[0]);
            totalLength += it.data[0].length;
        });
    var concatArr = new Uint8Array(totalLength);
    var index = 0;
    upload.chunks.forEach(it =>
        {
            concatArr.set(it.data[0], index);
            index += it.data[0].length;
        });


    var name = upload.uploadToken + "." + upload.ext;
    var filepath = "upload/" + name;
    var path = "/" + filepath;

    switch (upload.operation)
    {
        case "avatar":
            var stream = mongoAsync.fs.openUploadStreamWithId(name, name);
            await stream.write(concatArr);
            stream.end();
            if (upload.user.photo && upload.user.photo.startsWith('/upload/'))
            {
                // delete the old userpic
                mongoAsync.fs.delete(upload.user.photo.substring(8), err => { if (err) console.error(err); });
            }
            await mongoUpdate('users', { _id: upload.user._id, photo: path });
            return;
        case "backup":
            //await fs.writeFile(filepath, concatArr);
            //console.info("Wrote " + totalLength + " bytes");
            clearTempFolder();
            await fs.writeFile("temp/backup.zip", concatArr);
            console.info("Backup uploaded: " + totalLength + " bytes");
            await applyBackup();
            return;
    }
}
import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
    mongoUpdate,
    clearTempFolder,
    setServerConfig } from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
	USER_LEVEL_OWNER, 
    guid, 
    generateToken} from '../utility';

import fs from 'fs';
const extract = require('extract-zip');
const ObjectID = require('mongodb').ObjectID;

export async function applyBackup()
{
    var path = __dirname + '\\..\\temp';
    extract('temp/backup.zip', { dir: path }, async (error) =>
    {
        if (error)
        {
            console.error(error);
            return;            
        }
        
        await mongoAsync.db.dropDatabase();

        fs.readdir(path + '\\temp', function (err, files)
        {
            if (err)
            {
                return console.error('Unable to scan directory: ' + err);
            } 
            files.forEach(async (file) =>
            {
                if (file.endsWith('.json'))
                {
                    var tableName = file.substr(0, file.length - 5);
                    var table = mongoAsync.dbCollections[tableName];
                    if (table)
                    {
                        console.info('Recovering ' + tableName + ' from backup...');
                        var jsonDataFile = JSON.parse(fs.readFileSync('temp/temp/' + file));
                        jsonDataFile.forEach(item =>
                          {
                            if (item._id)
                              item._id = new ObjectID(item._id);
                          })
                        await table.deleteMany({});
                        if (jsonDataFile.length)
                        {
                            var r = await table.insertMany(jsonDataFile);
                            jsonDataFile = r.ops;
                        }
                        if (tableName === 'users')
                        {
                            var owner = jsonDataFile.find(it => it.role === 'owner');
                            if (owner)
                            {
                                await mongoAsync.dbCollections.serverConfig.insertOne({ isOperational: true, owner: owner._id });
                            }
                        }
                    }
                }
            });
        });
        fs.readdir(path + '\\temp\\files', function (err, files)
        {
            if (err)
            {
                return console.error('Unable to scan directory: ' + err);
            } 
            files.forEach(async (file) =>
            {
                var path = 'temp/temp/files/' + file;
                var stream = mongoAsync.fs.openUploadStreamWithId(file, file);
                var data = fs.createReadStream(path);
                data.pipe(stream);
            });
        });
    });
}

export async function uploadBackup(user, req, params, { ext })
{
    if (!checkPrivilege(user, USER_LEVEL_OWNER))
    {
        return { status: 403, message: "Only site OWNER can upload backup files" };
    }
    if (!ext || ext != 'zip')
    {
        return { status: 406, message: "Wrong backup extension, should be zip" };
    }
    
    clearTempFolder();

    var stream = fs.createWriteStream("temp/backup.zip");
    stream.on('close', applyBackup);
    req.pipe(stream);
    return { success: true };
}
import { mongoAsync } from '../serverStartup';

import {
    serverReady,
    max,
    getMiddleGround,
    shortLabel,
    mongoInsert,
	mongoUpdate, 
    tableNames,
    clearTempFolder} from './_common';

import {
	getLevel,
	checkPrivilege,
	USER_LEVEL_VISITOR,
	USER_LEVEL_MEMBER,
	USER_LEVEL_MODERATOR,
	USER_LEVEL_ADMIN,
    USER_LEVEL_OWNER, 
    isValidArgument} from '../utility';

const fs = require('fs');
const archiver = require('archiver');

async function writeTable(tableName)
{
    var items = await mongoAsync.dbCollections[tableName].find().toArray();
    var text = JSON.stringify(items, null, 2);
    fs.writeFileSync("temp\\" + tableName + ".json", text);
}

async function downloadFile(filename)
{
    var stream = mongoAsync.fs.openDownloadStreamByName(filename);
    var ws = fs.createWriteStream("temp\\files\\" + filename);
    var resolver;
    var promise = new Promise((resolve, reject) =>
    {
        resolver = resolve;
    });
    stream.on('end', () => {
        resolver();
    })
    stream.pipe(ws);
    await promise;
}

async function writeFiles(list)
{
    var tasks = [];
    list.forEach(it =>
        {
            tasks.push(downloadFile(it.filename));
        });
    await Promise.all(tasks);
}

export default async function getBackup(user)
{
    if (!checkPrivilege(user, USER_LEVEL_OWNER))
    {
        return { status: 403, message: "You must be the OWNER to get the backup." };
    }

    clearTempFolder();
    fs.mkdir("temp/files");

    var fileList = await mongoAsync.fs.find().toArray();

    var writeTasks = [writeFiles(fileList)];
    tableNames.forEach(it => writeTasks.push(writeTable(it)));

    await Promise.all(writeTasks);

    var output = fs.createWriteStream('temp\\backup.zip');
    var archive = archiver('zip');

    var resolver;
    var ready = false;
    var semaphore = new Promise((resolve, reject) =>
    {
        resolver = resolve;
    });

    output.on('close', function ()
    {
        console.info('Backup generated, ' + archive.pointer() + ' total bytes');
        ready = true;
        resolver();
    });

    archive.on('error', function(err)
    {
        throw err;
    });

    archive.pipe(output);

    tableNames.forEach(it => archive.file('temp\\' + it + '.json'));
    fileList.forEach(it => archive.file('temp\\files\\' + it.filename));

    archive.finalize();

    if (!ready)
        await semaphore;

    return { success: true, filename: 'temp\\backup.zip' };
}
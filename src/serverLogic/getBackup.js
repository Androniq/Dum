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
    isValidArgument} from '../utility';

export default async function getBackup(user)
{
    if (!checkPrivilege(user, USER_LEVEL_OWNER))
    {
        return { status: 403, message: "You must be the OWNER to get the backup." };
    }

    var fs = require('fs');
    var archiver = require('archiver');

    var articles = await mongoAsync.dbCollections.articles.find().toArray();
    var articlesText = JSON.stringify(articles, null, 2);
    var args = await mongoAsync.dbCollections.arguments.find().toArray();
    var argumentsText = JSON.stringify(args, null, 2);
    var blog = await mongoAsync.dbCollections.blog.find().toArray();
    var blogText = JSON.stringify(blog, null, 2);
    
    if (!fs.existsSync('temp'))
    {
        fs.mkdirSync('temp');
    }

    fs.writeFileSync("temp\\articles.json", articlesText);
    fs.writeFileSync("temp\\arguments.json", argumentsText);
    fs.writeFileSync("temp\\blog.json", blogText);

    var output = fs.createWriteStream('public\\backup.zip');
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
    archive.file('temp\\articles.json');
    archive.file('temp\\arguments.json');
    archive.file('temp\\blog.json');
    archive.finalize();

    if (!ready)
        await semaphore;

    return { success: true, filename: 'public\\backup.zip' };
}
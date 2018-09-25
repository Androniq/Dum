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
    USER_LEVEL_OWNER } from '../utility';

    export async function getBlogByUrl(url)
    {
        var blog = await mongoAsync.dbCollections.blog.findOne({ Url: url });
        if (!blog)
            return null;
        var owner = await mongoAsync.dbCollections.users.findOne({ _id: blog.Owner });
        if (!owner)
        {
            owner = await mongoAsync.dbCollections.users.findOne();
        }
        blog.Owner = owner;
        return blog;
    }
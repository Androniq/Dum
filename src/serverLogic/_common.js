import { mongoAsync } from '../serverStartup';

export async function serverReady() {
  if (mongoAsync.ready) { return; }
  await mongoAsync.serverReadyPromise;
}

const ObjectID = require('mongodb').ObjectID;

// local utilities

export function max(array) {
    const len = array.length;
    if (!len || len < 1) return null;
    let current = array[0];
    let count = 1;
    let firstIndex = 0;
    let lastIndex = 0;
    for (let index = 1; index < len; index++) {
      const val = array[index];
      if (val > current) {
        current = val;
        count = 1;
        firstIndex = index;
        lastIndex = index;
      } else if (val === current) {
        count++;
        lastIndex = index;
      }
    }
    const result = {
      value: current,
      count,
      firstIndex,
      lastIndex,
    };
    return result;
  }

export function getMiddleGround(code1, code2) {
    if (code1 === code2)
      // weird case, but who knows...
      return code1;
    if (code1 > code2) {
          // alphabetical order
      const swap = code1;
      code1 = code2;
      code2 = swap;
    }
    switch (`${code1}+${code2}`) {
      // unique middle-ground codes
      case 'A+AB':
        return 'AAB';
      case 'AB+EQ':
        return 'ABE';
      case 'BA+EQ':
        return 'BAE';
      case 'B+BA':
        return 'BBA';
      case 'EQ+S':
        return 'EQS';
  
      // middle-ground codes that coincide with some 'pure' codes
      case 'AB+BA':
        return 'EQ';
      case 'A+EQ':
        return 'AB';
      case 'B+EQ':
        return 'BA';
    }
    return 'N'; // there is no middle ground
  }

export function shortLabel(str)
{
    const maxlen = 12;
    if (str.length <= maxlen) return str;
    return `${str.substr(0, maxlen - 2)}...`;
}

// Database operations

export async function mongoFind(collection, id, projection)
{
  if (typeof collection === 'string')
    collection = mongoAsync.dbCollections[collection];
  if (typeof id === 'string')
    id = new ObjectID(id);
  if (Array.isArray(id))
  {
    if (!id.length)
      return [];
    for (let index = 0; index < id.length; index++)
    {
      if (typeof id[index] === 'string')
        id[index] = new ObjectID(id[index]);
    }
    return await collection.find({ _id: { $in: id } }, projection).toArray();
  }
	return await collection.findOne({ _id: id }, projection);
}

export async function mongoInsert(collection, item, user)
{
  if (typeof collection === 'string')
    collection = mongoAsync.dbCollections[collection];
	var now = new Date();
	item.DateCreated = now;
	item.DateUpdated = now;
	if (user)
		item.Owner = user._id;
	return await collection.insertOne(item);
}

export async function mongoUpdate(collection, item)
{
  if (typeof collection === 'string')
    collection = mongoAsync.dbCollections[collection];
	var now = new Date();
  item.DateUpdated = now;
  var id = new ObjectID(item._id);
  delete item._id;
	return await collection.updateOne({ _id: id }, { $set: item });
}

export async function mongoDelete(collection, id)
{
  if (typeof collection === 'string')
    collection = mongoAsync.dbCollections[collection];
  if (typeof id === 'string')
    id = new ObjectID(id);
  return await collection.deleteOne({ _id: id });
}

export async function setServerConfig(config)
{
  for (var propName in config)
  {
    mongoAsync.serverConfig[propName] = config[propName];
  }
  await mongoAsync.dbCollections.serverConfig.updateOne({ _id: mongoAsync.serverConfig._id }, { $set: config });
  if (config.owner)
  {
    var id = config.owner.toString();
    await setSiteOwner(mongoAsync.dbCollections.votes, id);
    await setSiteOwner(mongoAsync.dbCollections.priorities, id);
    await setSiteOwner(mongoAsync.dbCollections.articles, id);
    await setSiteOwner(mongoAsync.dbCollections.arguments, id);
    await setSiteOwner(mongoAsync.dbCollections.colors, id);
    await setSiteOwner(mongoAsync.dbCollections.blog, id);
  }
};

async function setSiteOwner(collection, id)
{
  var items = await collection.find({ Owner: "SITEOWNER" }).toArray();
  for (let index = 0; index < items.length; index++)
  {
    items[index].Owner = id;
    await collection.updateOne({ _id: items[index]._id }, { $set: items[index] });
  }
}
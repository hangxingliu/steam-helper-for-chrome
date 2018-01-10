//@ts-check
/// <reference path="./api.d.ts" />
/// <reference path="./database/database.d.ts" />

import { Tables } from "./database/core";

/** 
 * @param {SteamUserOverview} user
 * @param {SteamInventoryItem[]} items
 * @returns {Promise<string[]>}
 */
export function queryAreInventoriesRemoved(user, items) {
	let where = ['steamId', 'appId', 'contextId', 'assetId'];
	/** @type {any} */
	let anyOf = items.map(it => [user.steamID, it.appid, it.contextid, it.assetid]);

	return Tables.removed.where(where).anyOf(anyOf).toArray()
		.then(results => Promise.resolve(items.map(it => isRemoved(it, results))));
}

/** 
 * @param {SteamUserOverview} user
 * @param {SteamInventoryItem} item
 * @param {string} reason
 */
export function markAnInventoryIsRemoved(user, item, reason) { 
	return Tables.removed.put({
		steamId: user.steamID,
		appId: item.appid,
		contextId: item.contextid,
		assetId: item.assetid,
		reason: reason,
		timestamp: Date.now()
	});
}

/**
 * @param {SteamInventoryItem} item 
 * @param {TableRemovedItem[]} results 
 */
function isRemoved(item, results) { 
	let appId = String(item.appid),
		assetId = item.assetid,
		contextId = item.contextid;
	for (let r of results) 
		if (assetId == r.assetId && contextId == r.contextId && appId == r.appId)
			return r.reason;
	return null;
}

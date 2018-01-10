//@ts-check
/// <reference path="./api.d.ts" />
/// <reference path="./database/database.d.ts" />

import { Dexie } from "dexie";
import { Tables } from "./database/core";
import { ajaxJSON, x_www_form_urlencoded } from "./ajax_utils";

/** @returns {Promise<number>} */
function _queryInventoryGems(appId, itemType, borderColor) {

	let url = `https://steamcommunity.com/auction/ajaxgetgoovalueforitemtype/?` +
		`appid=${appId}&item_type=${itemType}&border_color=${borderColor}`;	

	return ajaxJSON('GET', url).then(response => {
		if (!response.success)
			return Promise.reject(`query gems for inventory failed! (success = ${response.success})`);

		let gems = parseInt(response.goo_value);
		if (isNaN(gems))
			return Promise.reject(`invalid gems! (response: ${JSON.stringify(response)})`);	
		return Promise.resolve(gems);
	});
}

/** @returns {Promise<{gems: number; fromCache: boolean}>} */
export function queryInventoryGems(appId, itemType, borderColor, allowCache = true) {
	let fromCache = false;
	return Tables.cacheGems.where({ appId, itemType, borderColor })
		.first().then(item => {
			if (!allowCache || !item)
				return _queryInventoryGems(appId, itemType, borderColor).then(gems => ({ gems }));
			
			fromCache = true;
			return item;
		}).then(_item => { 
			/** @type {DBCacheGems} */
			let item = _item;
			let result = { gems: item.gems, fromCache };
			if (fromCache)
				return result;
			
			return Tables.cacheGems.put({
				appId, itemType, borderColor,
				gems: item.gems,
				timestamp: Date.now()
			}).then(() => {
				console.log(`Update inventory gems info: (${appId},${itemType},${borderColor}) => ${item.gems}`);
				return result;
			});
		});
}

/** @param {SteamInventoryItemDescription} inventoryDescription */
export function isInventoryHasGems(inventoryDescription) { 
	if (!inventoryDescription)
		return false;
	
	let { owner_actions } = inventoryDescription;
	if (!owner_actions || owner_actions.length == 0)
		return false;
	
	for (let action of owner_actions)
		if (action && action.link  && action.link.match(/^javascript:GetGooValue\(/))
			return true;
	
	return false;
}

/** 
 * @param {SteamInventoryItemDescription} desc 
 * @returns {Promise<{gems: number; fromCache: boolean}>}
 */
export function queryInventoryGemsByDescription(desc, allowCache = true) { 
	let query = { appId: '', itemType: '', borderColor: '' };
	desc.owner_actions
		.filter(a => a.link.match(/^javascript:GetGooValue\(/))
		.forEach(action => {
			let matched = action.link.match(/(\w+),\s*(\w+),\s*(\w+)\s*\)\s*$/);
			if (matched)
				query = { appId: matched[1], itemType: matched[2], borderColor: matched[3] };
		});
	if (!query.appId)
		return Promise.resolve(null);
	return queryInventoryGems(query.appId, query.itemType, query.borderColor, allowCache);
}

/**
 * @param {SteamUserOverview} userOverview 
 * @param {SteamInventoryItem} item 
 * @param {number} expectedGems
 * @returns {Promise<string>} convert success description html 
 */
export function convertInventoryToGems(userOverview, item, expectedGems) { 
	let url = `https://steamcommunity.com/id/hangxingliu/ajaxgrindintogoo/`;
	let parameters = [
		['sessionid', userOverview.sessionID],
		['appid', item.appid],
		['assetid', item.assetid],
		['contextid', item.contextid],
		['goo_value_expected', expectedGems],
	].map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');

	return ajaxJSON('POST', url, parameters, x_www_form_urlencoded).then(response => {
		if (!response.success)
			return Promise.reject(`convert inventory to gems failed! (success = ${response.success})`);

		// ['strHTML']
		// ['goo_value_received ']
		// ['goo_value_total']
		return Promise.resolve(response.strHTML);
	});
}
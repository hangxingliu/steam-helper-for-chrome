//@ts-check
/// <reference path="./api.d.ts" />
/// <reference path="./database/database.d.ts" />

import { Dexie } from "dexie";
import { Tables } from "./database/core";

export const segmentSize0 = 75, segmentSize1 = 2000;
export const defaultImageCDN = `https://steamcommunity.com`;

/** @returns {Promise<SteamUserInventoryOverview>} */
export function getCurrentUserOverview() { 
	const URL = `https://steamcommunity.com/my/inventory`;	

	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', URL);
		xhr.onload = () => {
			if (xhr.readyState != 4 || xhr.status != 200)
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);
			
			let html = xhr.responseText;
			let doc = document.createElement('html');
			doc.innerHTML = html;
			
			/** @type {SteamUserInventoryOverview} */
			let result = { needLogin: true };
			
			let steamID = html.match(/g_steamID\s*=\s*["'](\w+)['"]/);
			if (!steamID) return resolve(result);
			result = { needLogin: false, steamID: steamID[1] };

			let sessionID = html.match(/g_sessionID\s*=\s*["'](\w+)['"]/);
			result.sessionID = sessionID ? sessionID[1] : '';

			let strLanguage = html.match(/g_strLanguage\s*=\s*["'](\w+)['"]/);
			result.strLanguage = strLanguage ? strLanguage[1] : 'english';

			let categoryJSON = html.match(/g_rgAppContextData\s*=\s*([\s\S]+?);/);
			let categoryObj = {};
			try { categoryObj = JSON.parse(categoryJSON ? categoryJSON[1] : '{}'); }
			catch (ex) { console.warn(`JSON of g_rgAppContextData is invalid! (${ex ? ex.message : ''})`); }

			let walletJSON = html.match(/g_rgWalletInfo\s*=\s*([\s\S]+?);/);
			let walletObj = {};
			try { walletObj = JSON.parse(walletJSON ? walletJSON[1] : '{}'); }
			catch (ex) { console.warn(`JSON of g_rgWalletInfo is invalid! (${ex ? ex.message : ''})`); }
			result.wallet = {
				currency: walletObj.wallet_currency || 0,
				country: walletObj.wallet_country || '',
				balance: (parseInt(walletObj.wallet_balance || '0') / 100)
			};

			/** @type {HTMLImageElement} */
			let $avatar = doc.querySelector('.profile_small_header_avatar .playerAvatar img');
			result.avatar = $avatar ? $avatar.src : '';

			let $nickName = doc.querySelector('.profile_small_header_name a');
			result.nickName = $nickName ? $nickName.innerHTML : '';

			let $userName = doc.querySelector('#account_pulldown');
			result.userName = $userName ? $userName.innerHTML : '';
			
			result.category = [];
			for (let key in categoryObj) { 
				let c = categoryObj[key], 
					contexts = Object.keys(c.rgContexts || {}).map(k => c.rgContexts[k]);
				result.category.push({
					appid: c.appid || '',
					count: c.asset_count || 0,
					icon: c.icon || '',
					image: c.inventory_logo || '',
					link: c.link || 'http://steamcommunity.com',
					name: c.name || '',
					context: contexts.map(ctx => ({
						count: ctx.asset_count,
						id: ctx.id, name: ctx.name
					}))
				});
			}

			resolve(result);
		}
		xhr.onerror = (err) => reject(err);
		xhr.send();
	});
}

/** @returns {Dexie.Promise<SteamUserInventoryOverview>} */
export function getCurrentUserOverviewWithCache() { 
	/** @type {SteamUserInventoryOverview} */
	let userInfo = null;
	let getFromCache = false, cacheDate = Date.now();
	
	return Tables.cacheUserOverview
		.orderBy('timestamp').reverse().toArray().then(_caches => {
			/** @type {DBCacheUserOverview[]} */
			let caches = _caches;
			if (caches.length == 0)
				return getCurrentUserOverview();

			userInfo = caches[0].data;
			getFromCache = true;
			cacheDate = caches[0].timestamp;
			return userInfo;
		}).then(_userInfo => {
			userInfo = _userInfo;
			if (!getFromCache) {
				//storage to cache
				return Tables.cacheUserOverview
					.put({ steamId: userInfo.steamID, data: userInfo, timestamp: cacheDate })
					.then(() => {
						console.log(`Update user overview cache: ${userInfo.userName}(${userInfo.steamID})`)
						return userInfo;
					});
			}
			console.log(`Use user overview cache: ${new Date(cacheDate).toLocaleString()}`)
			return userInfo;
		});
}

/**
 * @returns {Promise<SteamInventoryQueryResult>}
 */
export function listInventory(steamId = '', appId = '753', contextId = '6', {
	strLanguage = 'english',
	count = segmentSize0,
	startAssetId = ''
}) { 
	console.log(`listInventory(${steamId}, ${appId}, ${contextId}` +
		`, ${strLanguage}, ${count}, ${startAssetId})`);

	let url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?`;
	url += `l=${encodeURIComponent(strLanguage)}&`;
	url += `count=${count}&`;
	if (startAssetId)
		url += `start_assetid=${startAssetId}&`;
	
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = () => {
			if (xhr.readyState != 4 || xhr.status != 200)
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);

			/** @type {SteamInventoryRawResponse} */
			let response = null;
			try {
				response = JSON.parse(xhr.responseText);
			} catch (ex) { 
				return reject(`xhr.responseText is not a valid JSON object`);
			}
			if (response.success != 1)
				return resolve({ success: false });
			
			/** @type {SteamInventoryQueryResult} */
			let result = { success: true };
			if (response.more_items == 1) {
				result.hasNextSegment = true;
				result.lastAssetId = response.last_assetid;
			}

			result.totalCount = response.total_inventory_count;
			result.items = response.assets;
			result.descriptions = response.descriptions;
			
			resolve(result);
		}
		xhr.onerror = (err) => reject(err);
		xhr.send();
	});
}

export function clearSteamCache() { 
	return Tables.cacheInventoryInfo.clear()
		.then(() => Tables.cacheInventoryData.clear())
		.then(() => Tables.cacheUserOverview.clear());
}

/** @type {(now: number, total: number) => Promise} */
export const DEFAULT_PROGRESS_CALLBACK = (now, total) => Promise.resolve(true);

export function listAllInventoryWithCache(
	steamId = '', appId = '753', contextId = '6',
	strLanguage = 'english',
	progressCallback = DEFAULT_PROGRESS_CALLBACK
) { 
	// item count in segment: 75, 2000, 2000 ...
	return Tables.cacheInventoryInfo
		.where({ steamId, appId, contextId })
		.first()
		.then(item => {
			// console.log(item);	
			if (!item)
				return fetchNewInfo();
			return Promise.resolve(item);
		}).then(_info => {
			/** @type {DBCacheInventoryInfoItem} */
			let info = _info;
			let { count, segmentCount } = info;
			return Tables.cacheInventoryData
				.filter(it => it.steamId == steamId && it.appId == appId && it.contextId == contextId)
				.toArray()
				.then(async (_items) => {
					/** @type {DBCacheInventoryDataItem[]} */
					let items = _items.sort((a, b) => a.segmentId - b.segmentId);
					let itemLen = items.length;
					if (itemLen == segmentCount)
						return returnResult(items, count);

					try {
						let progress = [items.reduce((a, b) => a + b.count, 0), count];
						for (let i = itemLen; i < segmentCount; i++) {
							await progressCallback(...progress);
							let it = await fetchSegmentNotFirstAndSaveToDB(items[i - 1].lastAssetId, i);
							items.push(it);
							console.log(it);
							progress[0] += it.data.items.length;
						}
					} catch (ex) { return Promise.reject(ex); }
					
					return returnResult(items, count);
				});
		});
	
	/** @param {DBCacheInventoryDataItem[]} items */
	function returnResult(items, totalCount = 0) { 
		let segments = items
			.map(it => it.data)
			.map(it => ({ items: it.items, descriptions: it.descriptions }));
		return Promise.resolve({ segments, totalCount });
	}

	function fetchSegmentNotFirstAndSaveToDB(startAssetId = '', segmentId = 0) { 
		/** @type {DBCacheInventoryDataItem} */
		let ret = null;
		return listInventory(steamId, appId, contextId,
			{ strLanguage, count: segmentSize1, startAssetId })
			.then(result => {
				if (!result.success)
					return Promise.reject(`fetch inventory segment ${segmentId} of ` +
						`${JSON.stringify({ steamId, appId, contextId })} failed! (success != 1)`);
				ret = {
					steamId, appId, contextId,
					segmentId: segmentId, count: result.items.length,
					lastAssetId: result.lastAssetId, data: result,
					timestamp: Date.now()
				};
				return Tables.cacheInventoryData.put(ret);
			}).then(() => Promise.resolve(ret));
	}

	function fetchNewInfo() {

		/** @type {SteamInventoryQueryResult} */
		let info = null;

		/** @type {DBCacheInventoryInfoItem} */
		let infoDBItem = null;
		
		return listInventory(steamId, appId, contextId, { strLanguage, count: segmentSize0 })
			.then(_info => {
				info = _info;
				return Promise.resolve(true);
			}).then(() => {
				infoDBItem = {
					steamId, appId, contextId,
					count: info.totalCount,
					segmentCount: calcSegmentCountFromCount(info.totalCount),
					timestamp: Date.now()
				};
				return Tables.cacheInventoryInfo.put(infoDBItem)
			}).then(() => {
				/** @type {DBCacheInventoryDataItem} */
				let item = {
					steamId, appId, contextId,
					segmentId: 0, count: info.items.length,
					lastAssetId: info.lastAssetId, data: info,
					timestamp: Date.now()
				};
				return Tables.cacheInventoryData.put(item);
			}).then(() => {
				return Promise.resolve(infoDBItem);
			});
	}
}

function calcSegmentCountFromCount(count = 0) { 
	if (count <= 0) return 0;
	if (count <= segmentSize0) return 1;

	count -= segmentSize0;
	let page = 1;
	while (count > 0) { count -= segmentSize1; page++; }
	return page;
}
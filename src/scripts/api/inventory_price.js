//@ts-check
/// <reference path="./api.d.ts" />

import { Tables } from "./database/core";
import { setTimeout } from "timers";

const DURATION_NORMAL = 200;
const DURATION_429 = 60 * 1000; // 429: too many request

let last429time = 0;

export const PRICE_API_LIMIT_PER_MINUTE = 20;
export function getLast429Timestamp() { return last429time; }

/**
 * @param {string} appId 
 * @param {string} marketHashName 
 * @param {SteamWalletInfo} walletInfo 
 * @returns {Promise<SteamMarketPriceInfo>}
 */
function getInventoryMarketPrice(appId, marketHashName, walletInfo) { 
	const URL = `https://steamcommunity.com/market/priceoverview/?country=${walletInfo.country}&` +
		`currency=${walletInfo.currency}&appid=${appId}` +
		`&market_hash_name=${decodeURIComponent(marketHashName)}`;	

	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', URL);
		xhr.onload = () => {
			if (xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 500) )
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);
			
			let json = xhr.responseText;
			let obj = {};
			try { obj = JSON.parse(json); }
			catch (ex) { return reject(`Invalid market price info SON response`); }
			
			if (!obj.success)
				return resolve({ lowestPrice: '--', last24hrs: 0, timestamp: Date.now() });
			
			/** @type {SteamMarketPriceInfo} */
			let result = { 
				lowestPrice: obj.lowest_price || '',
				last24hrs: parseInt((obj.volume || '0').replace(/\D/g, '')),
				timestamp: Date.now(),
			};
			resolve(result);
		}
		xhr.onerror = (err) => reject(err);
		xhr.send();
	});
}


/** @type {SteamMarketPriceInfoQuery} */
let queryQueue = [];
let queryingQueue = false;

export function getPriceQueryQueueLength() { return queryQueue.length; }

/**
 * @param {SteamMarketPriceInfoQuery} query 
 * @param {SteamWalletInfo} walletInfo 
 * @param {(partOfResult: SteamMarketPricePartResult) => any} resultCallback
 * @param {(ex: string|Error) => any} exceptionCallback
 */
export function queryMarketPrices(query, walletInfo, resultCallback, exceptionCallback, { 
	justNow = false,
	noCache = false
}) {
	query = removeDuplicatedQuery(query);

	let PromiseChains = Promise.resolve([]);
	if (!noCache)
		PromiseChains = Tables.cacheMarketPrice.where(['appId', 'marketHashName'])
			//@ts-ignore for query.map
			.anyOf(query.map(q => [String(q.appId), String(q.marketHashName)])).toArray();

	return PromiseChains.then(_results => {
		/** @type {DBCacheMarketPrice[]} */
		let dbResults = _results;

		if(dbResults.length > 0)
			resultCallback(dbResults.map(it => Object.assign({ fromCache: true }, it)));
		
		// remove query found in cache
		query = query.filter(q => { 
			for (let r of dbResults)
				if (r.marketHashName == q.marketHashName && r.appId == q.appId)
					return false;
			return true;
		});

		if (justNow)
			return justNowQuery();	

		queryQueue = queryQueue.concat(query);
		return startQueryPriceQueue(walletInfo, resultCallback, exceptionCallback);

		async function justNowQuery() { 
			try {
				for (let { appId, marketHashName } of query) {
					let price = await getInventoryMarketPrice(appId, marketHashName, walletInfo);
					await updateCache(appId, marketHashName, price)
					resultCallback([Object.assign({ appId, marketHashName, fromCache: false }, price)]);

					await sleep(DURATION_NORMAL);
				}
			} catch (ex) { 
				exceptionCallback(ex);
			}	
		}
	});
	
}

/**
 * @param {SteamWalletInfo} walletInfo 
 * @param {(partOfResult: SteamMarketPricePartResult) => any} resultCallback
 * @param {(ex: string|Error) => any} exceptionCallback
 */
export function startQueryPriceQueue(walletInfo, resultCallback, exceptionCallback) { 
	if (queryQueue.length == 0) {
		queryingQueue = false;
		return;
	}
	if (queryingQueue)
		return;
	
	// wait 429 froze
	if (last429time + DURATION_429 > Date.now())
		return setTimeout(() =>
			startQueryPriceQueue(walletInfo, resultCallback, exceptionCallback),
			DURATION_NORMAL);	
	
	queryingQueue = true;

	/** @type {SteamMarketPriceInfo} */
	let priceInfo = null;
	let { appId, marketHashName } = queryQueue[0];
	
	getInventoryMarketPrice(appId, marketHashName, walletInfo)
		.then(price => {
			priceInfo = price;
			return updateCache(appId, marketHashName, price)
		}).then(() => {
			queryQueue.shift();
			queryingQueue = false;
			resultCallback([{ appId, marketHashName, fromCache: false, ...priceInfo }]);

			setTimeout(() => startQueryPriceQueue(walletInfo, resultCallback, exceptionCallback),
				DURATION_NORMAL);
		}).catch(ex => {
			let is429 = (typeof ex == 'string' && ex.indexOf('xhr.status = 429') >= 0);
			if(is429) last429time = Date.now();
			console.error(`get price info failed!(${appId} ${marketHashName})`);
			console.error(ex);
			exceptionCallback(ex);

			queryingQueue = false;
			// got from steam but storage failed: don't continue
			if (priceInfo)
				return;
			
			setTimeout(() =>
				startQueryPriceQueue(walletInfo, resultCallback, exceptionCallback),
				is429 ? DURATION_429 : DURATION_NORMAL);
		})
	
			// await sleep(DURATION_NORMAL);
	
}

/**
 * @param {SteamMarketPriceInfoQuery} query
 * @returns {Promise<{results: SteamMarketPricePartResult, missing: SteamMarketPriceInfoQuery}>} 
 */
export function queryMarketPricesOnlyFromCache(query) { 
	query = removeDuplicatedQuery(query);
	
	return Tables.cacheMarketPrice.where(['appId', 'marketHashName'])
		//@ts-ignore for query.map
		.anyOf(query.map(q => [String(q.appId), String(q.marketHashName)])).toArray()
		.then(_results => {
			/** @type {DBCacheMarketPrice[]} */
			let results = _results;
			
			// remove query found in cache
			let missing = query.filter(q => { 
				for (let r of results)
					if (r.marketHashName == q.marketHashName && r.appId == q.appId)
						return false;
				return true;
			});

			return Promise.resolve({ missing, results });
		});
}

/** @param {SteamMarketPriceInfo} priceInfo */
function updateCache(appId, marketHashName, priceInfo) { 
	let item = { appId: String(appId), marketHashName, ...priceInfo };
	return new Promise((resolve, reject) => 
		Tables.cacheMarketPrice.put(item).then(resolve).catch(reject));
}

/** @param {SteamMarketPriceInfoQuery} query */
function removeDuplicatedQuery(query) { 
	let map = {};
	let result = [];
	for (let q of query) { 
		let { appId, marketHashName } = q;
		if ((appId in map) && (marketHashName in map[appId]))
			continue;
		
		if (!(appId in map))
			map[appId] = {};
		map[appId][marketHashName] = true;
		result.push(q);
	}
	return result;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

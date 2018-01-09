//@ts-check
/// <reference path="./api.d.ts" />
/// <reference path="./database/database.d.ts" />

import { Dexie } from "dexie";
import { Tables } from "./database/core";

/** @returns {Promise<SteamUserOverview>} */
function _getUserOverviewWithoutDB() { 
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
			
			/** @type {SteamUserOverview} */
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

/** @returns {Dexie.Promise<SteamUserOverview>} */
export function getUserOverview(allowCache = true) { 
	/** @type {SteamUserOverview} */
	let userInfo = null;
	let getFromCache = false, cacheDate = Date.now();
	
	return Tables.cacheUserOverview
		.orderBy('timestamp').reverse().toArray().then(_caches => {
			/** @type {DBCacheUserOverview[]} */
			let caches = _caches;
			if (!allowCache || caches.length == 0)
				return _getUserOverviewWithoutDB();

			userInfo = caches[0].data;
			getFromCache = true;
			cacheDate = caches[0].timestamp;
			return userInfo;
		}).then(_userInfo => {
			userInfo = Object.assign({ fromCache: getFromCache }, _userInfo);
			if (!getFromCache) {
				console.log(userInfo);
				//storage to cache
				return Tables.cacheUserOverview
					.put({ steamId: userInfo.steamID, data: userInfo, timestamp: cacheDate })
					.then(() => {
						console.log(`Update user overview cache: ${userInfo.userName}(${userInfo.steamID})`)
						return userInfo;
					});
			}
			// console.log(`Use user overview cache: ${new Date(cacheDate).toLocaleString()}`)
			return userInfo;
		});
}

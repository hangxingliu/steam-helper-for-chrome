//@ts-check
/// <reference path="./utils.d.ts" />

function getAppIdFromURL(url = "") { 
	let matched = url.match(/app\/(\d+)/);
	if (!matched)
		return null;
	return matched[1];
}

function getSteamDBLink(appId = '') { return `https://steamdb.info/app/${appId}/`; }

/**
 * @param {string} appId 
 * @param {string} country 
 * @returns {Promise<PriceHistoryArray>} 
 */
function getPriceHistory(appId, country) { 
	const API = 'https://steamdb.info/api/GetPriceHistory/?appid={}&cc={}';
	let url = API
		.replace('{}', encodeURIComponent(appId))
		.replace('{}', country);
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = () => { 
			if (xhr.readyState != 4 || xhr.status != 200)
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);
			let object = {};
			try { object = JSON.parse(xhr.responseText); }
			catch (ex) { return reject('response is not json'); }

			if (!object.success) return reject(`response.success = ${object.success};`);
			if (!object.data) return reject(`response.data is empty;`);
			if (!object.data.final) return reject(`response.data.final is empty;`);
			if (!object.data.formatted) return reject(`response.data.formatted is empty;`);
			
			/** @type {PriceHistoryArray} */
			let result = [];
			for (let item of object.data.final)
				result.push({ from: new Date(item[0]), price: item[1], discount: 0 });
			let formatted = object.data.formatted;
			Object.keys(formatted).sort()
				.map(k => formatted[k])
				.forEach((item, i) => {
					result[i].discount = item.discount;
				});
			
			return resolve(result);
		}
		xhr.onerror = (err) => reject(err);
		xhr.send();
	});
}

module.exports = {
	getSteamDBLink,
	getAppIdFromURL,
	getPriceHistory
};
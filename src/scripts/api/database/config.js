//@ts-check
/// <reference path="./database.d.ts" />

import { Tables } from "./core";

/** @type {TableConfigItem[]} */
let configurations = null;

export function getConfigSync(key, defaultValue) { 
	if (!configurations) return defaultValue;
	for (let cfg of configurations)
		if (cfg.key == key)
			return cfg.value;
	return defaultValue;
}

/** @returns {Promise<TableConfigItem[]>} */
export function getAllConfig(forceFromDB = false) {
	if (!forceFromDB && configurations)
		return Promise.resolve(configurations);
	return Tables.config.toArray().then(items =>
		Promise.resolve(configurations = items));
}

/**
 * @param {string} key 
 * @param {string} [defaultValue] 
 * @returns {Promise<string>}
 */
export function getConfig(key, defaultValue) {
	return getAllConfig()
		.then(() => Promise.resolve(getConfigSync(key, defaultValue)));
}

/**
 * @param {string} key 
 * @param {string} value 
 */
export function setConfig(key, value) {
	return Tables.config.put({ key, value })	
		.then(() => getAllConfig(true));
}

/** @param {{[key: string]: string}} kvMap */
export function setConfigMap(kvMap) { 
	let bulkPut = Object.keys(kvMap).map(key => ({ key, value: kvMap[key] }));
	return Tables.config.bulkPut(bulkPut)
		.then(() => getAllConfig(true));
}

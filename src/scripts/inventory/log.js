//@ts-check
/// <reference path="../api/api.d.ts" />

/** @param {SteamUserOverview} user  */
export function logUserOverview(user) { 
	console.log(`UserOverview${user.fromCache?"(cached)":""}: {userName: ${user.userName},` +
		`steamID: ${user.steamID}, sessionId: ${user.sessionID}}`);
}

/** @param {SteamInventories} inventories */
export function logInventories(inventories) { 
	console.log(`Inventories: {count: ${inventories.totalCount}, ` +
		`segmentCount: ${inventories.segments.length}}`);
}

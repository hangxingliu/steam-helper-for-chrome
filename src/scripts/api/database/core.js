//@ts-check

import Dexie from 'dexie';

let Database = new Dexie('Steam Helper Database');

Database.version(1).stores({
	cacheInventoryInfo: '[steamId+appId+contextId],count,segmentCount,timestamp',
	cacheInventoryData: '[steamId+appId+contextId+segmentId],count,lastAssetId,data,timestamp',
	cacheUserOverview: 'steamId,data,timestamp'
});

let Tables = {
	cacheInventoryInfo: Database.table('cacheInventoryInfo'),
	cacheInventoryData: Database.table('cacheInventoryData'),
	cacheUserOverview: Database.table('cacheUserOverview')
};

Database.on('populate', () => {
	//Event occurred database initialize first time
});

export { Database, Tables };

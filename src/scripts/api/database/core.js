//@ts-check

import Dexie from 'dexie';

let Database = new Dexie('Steam Helper Database');

Database.version(1).stores({
	cacheInventoryInfo: '[steamId+appId+contextId],count,segmentCount,timestamp',
	cacheInventoryData: '[steamId+appId+contextId+segmentId],count,lastAssetId,data,timestamp',
	cacheUserOverview: 'steamId,data,timestamp',
	cacheMarketPrice: '[appId+marketHashName],lowestPrice,last24hrs,timestamp',
	cacheGems: '[appId+itemType+borderColor],gems,timestamp'
});

let Tables = {
	cacheInventoryInfo: Database.table('cacheInventoryInfo'),
	cacheInventoryData: Database.table('cacheInventoryData'),
	cacheUserOverview: Database.table('cacheUserOverview'),
	cacheMarketPrice: Database.table('cacheMarketPrice'),
	cacheGems: Database.table('cacheGems')
};

Database.on('populate', () => {
	//Event occurred database initialize first time
});

//Export database and tables to global for debugging
//@ts-ignore
global.databaseDebug = { Database, Tables };

export { Database, Tables };

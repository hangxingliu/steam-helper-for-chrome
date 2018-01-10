type DBCacheInventoryInfoItem = {
	steamId: string;
	appId: string;
	contextId: string;
	count: number;
	segmentCount:number;
	timestamp: number;
};
type DBCacheInventoryDataItem = {
	steamId: string;
	appId: string;
	contextId: string;
	segmentId: number;
	count:number;
	lastAssetId: string;
	data: SteamInventoryQueryResult;
	timestamp: number;
};
type DBCacheUserOverview = {
	steamId: string;
	data: SteamUserOverview;
	timestamp: number;
};
type DBCacheMarketPrice = {
	appId: string;
	marketHashName: string;
	lowestPrice: string;
	last24hrs: number;
	timestamp: number;
};
type DBCacheGems = {
	appId: string;
	itemType: number;
	borderColor: number;
	gems: number;
	timestamp: number;
};
type TableRemovedItem = {
	steamId: string;
	appId: string;
	contextId: string;
	assetId: string;
	
	reason: string;
	timestamp: number;
};
type TableConfigItem = {
	key: string;
	value: string;
};
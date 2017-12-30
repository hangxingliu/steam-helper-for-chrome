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
	data: SteamUserInventoryOverview;
	timestamp: number;
};
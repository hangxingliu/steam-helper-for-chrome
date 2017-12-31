type SteamUserInventoryOverview = {
	needLogin: boolean;

	avatar?: string;
	userName?: string;
	steamID?: string;
	sessionID?: string;
	nickName?: string;
	strLanguage?: string;

	category?: SteamInventoryCategory[];
};

type SteamInventoryCategoryContext = {
	count: number;
	id: string;
	name: string;
};
type SteamInventoryCategory = {
	appid: string;
	name: string;
	icon: string;
	image: string;
	link: string;
	count: number;
	context: SteamInventoryCategoryContext[];
}

type SteamInventoryOwnerAction =  {
	link: string;
	name: string;
};

type SteamInventoryTag =  {
	category: string;
	internal_name: string;
	localized_category_name: string;
	localized_tag_name: string;
};

type SteamInventoryItem = {
	appid: number;
	amount: string;
	assetid: string;
	classid: string;
	contextid: string;
	instanceid: string;
};
type SteamInventoryItemDescription =  {
	appid: number;
	classid: string;
	instanceid: string;
	currency: number;
	background_color: string;
	icon_url: string;
	icon_url_large: string;
	descriptions: { value: string; color?: string }[];
	owner_descriptions?: { value: string; color?: string }[];
	tradable: number;
	actions: SteamInventoryOwnerAction[];
	owner_actions: SteamInventoryOwnerAction[];
	name: string;
	name_color: string;
	type: string;
	market_name: string;
	market_hash_name: string;
	market_fee_app: number;
	commodity: number;
	market_tradable_restriction: number;
	market_marketable_restriction: number;
	marketable: number;
	tags: SteamInventoryTag[];
};

type SteamInventoryQueryResult = {
	success: boolean;

	items?: SteamInventoryItem[];
	descriptions?: SteamInventoryItemDescription[];
	lastAssetId?: string;
	hasNextSegment?: boolean;
	totalCount?: number;
};

type SteamInventories = {
	segments: {
		items: SteamInventoryItem[];
		descriptions: SteamInventoryItemDescription[];
	}[];
	totalCount: number;
};

type SteamInventoryDescriptionMap = {
	[classIdInstanceId: string]: SteamInventoryItemDescription;
}

type SteamInventoryTagsManager = {
	[category: string]: {
		category: string;
		name: string;
		tags: {
			[tag: string]: {
				id: string;
				name: string;
				count: number;
			}
		}
	}
};

type SteamInventoryFilter = {
	tags: { [category: string]: { [tag: string]: true } };
	keyword: string;
};

type SteamInventoryRawResponse = {
	assets: any[];
	descriptions: any[];
	rwgrsn: number;
	success: number; 
	total_inventory_count: number;

	last_assetid?: string;
	more_items?: number;
}

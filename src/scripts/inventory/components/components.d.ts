/// <reference path="../../api/api.d.ts" />

type MainContainerComponent = {
	error?: string;

	categorySelected: SteamInventoryCategory;
	categories: SteamInventoryCategory[];
	
	inventoriesLoading?: string;
	items: SteamInventoryItem[],
	descriptions: SteamInventoryItemDescription[]
	page: number;
	pageSize: number;
	totalPage: number;

	priceLoadingCount: number;

	onSwitchPage: (page: number) => any;
	onClickInventory: (item, desc) => any;

	selectedItem: SteamInventoryItem;
	selectedDescription: SteamInventoryItemDescription;

	inventoryTags: SteamInventoryTagsManager;
	filter: SteamInventoryFilter;
	onFilterUpdate: (newFilter: SteamInventoryFilter) => any;

	actionsHandler: InventoryActionsHandler;	
};

type InventoryItemComponent = {
	item: SteamInventoryItem,
	desc: SteamInventoryItemDescription,
	onClick: (item: SteamInventoryItem, desc: SteamInventoryItemDescription) => any;
};

type InventoryRightSideComponent = {
	item: SteamInventoryItem,
	description: SteamInventoryItemDescription,
	category: SteamInventoryCategory,

	actionsHandler: InventoryActionsHandler;
};

type InventoryActionsHandler = {
	toGems: Function;
};
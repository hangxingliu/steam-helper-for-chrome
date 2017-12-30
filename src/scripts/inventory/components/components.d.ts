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

	onSwitchPage: (page: number) => any;
	onClickInventory: (item, desc) => any;

	selectedItem: SteamInventoryItem;
	selectedDescription: SteamInventoryItemDescription;
};
const STEAM_BASE = `http://steamcommunity.com/my`;

const EXTENSION_INVENTORY = chrome.runtime.getURL('inventory.html');

export const links = [
	{
		url: `http://steam.tools/cards/`,
		title: `STC`,
		side: 'left'
	},
	{
		url: `http://steam.tools/`,
		title: `Steam Tools`,
		side: 'left'
	},
	{
		url: `https://steamdb.info/`,
		title: `Steam Database`,
		side: 'left'
	},
	{
		url: `http://store.steampowered.com`,
		title: `STEAM`,
		side: 'right'
	},
	{
		url: `${STEAM_BASE}/wishlist`,
		title: `愿望单`,
		side: 'right'
	},
	{
		url: `${STEAM_BASE}/`,
		title: `个人主页`,
		side: 'right'
	},
	{
		url: EXTENSION_INVENTORY, //`${STEAM_BASE}/inventory/`,
		title: `我的库存`,
		side: 'right'
	},
	{
		url: `http://steamcommunity.com/market/`,
		title: `社区市场`,
		side: 'right'
	},
];
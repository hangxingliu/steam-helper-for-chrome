const BASE = `http://steamcommunity.com/id/{}`;

module.exports = [
	{
		url: `http://steam.tools/cards/`,
		title: `STC`,
		side: 'left'
	},
	{
		url: `http://steam.tools/`,
		title: `SteamTools`,
		side: 'left'
	},
	{
		url: `http://store.steampowered.com`,
		title: `STEAM`,
		side: 'right'
	},
	{
		url: `${BASE}/wishlist`,
		title: `愿望单`,
		side: 'right'
	},
	{
		url: `${BASE}/`,
		title: `个人主页`,
		side: 'right'
	},
	{
		url: `${BASE}/inventory/`,
		title: `我的库存`,
		side: 'right'
	},
	{
		url: `http://steamcommunity.com/market/`,
		title: `社区市场`,
		side: 'right'
	},
];
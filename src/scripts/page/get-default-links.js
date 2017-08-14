const BASE = `http://steamcommunity.com/id/{}`;

module.exports = [
	{
		url: `http://store.steampowered.com`,
		title: `STEAM`
	},
	{
		url: `${BASE}/wishlist`,
		title: `愿望单`
	},
	{
		url: `${BASE}/`,
		title: `个人主页`
	},
	{
		url: `${BASE}/inventory/`,
		title: `我的库存`
	},
	{
		url: `http://steamcommunity.com/market/`,
		title: `社区市场`
	},
];
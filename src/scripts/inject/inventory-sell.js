let log = require('./utils/logger').create('inventory-sell.js');

global.app = new App();
function App() {
	document.addEventListener('click', () => {
		const CB_SELECTOR = `#market_sell_dialog_accept_ssa`;
		let cbs = $(CB_SELECTOR);
		notEqual2fatal(cbs.length, 1, `Steam销售勾选框(${CB_SELECTOR})不等于1个`);

		cbs[0].checked = true;
	});

	// 获取价格
	// fetch('http://steamcommunity.com/market/listings/753/566020-Game%20Within%20A%20Game%20(Profile%20Background)').then(function (response) {
	// 	return response.text();
	// }).then(function (text) {
	// 	console.log(text)
	// 	});
	
	
	//==========     Lib     ========================================
	function notEqual2fatal(a, b, desc) { if (a != b) throw desc; }
	function empty2fatal(v, desc) { if(!v) throw desc; }
	/**
	 * @param {string} [selector=''] 
	 * @param {any} base 
	 * @returns {NodeListOf<Element>}
	 */
	function $(selector = '', base = null) { return (base || document).querySelectorAll(selector); }
}

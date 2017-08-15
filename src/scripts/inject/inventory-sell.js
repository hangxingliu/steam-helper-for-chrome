//inject-info-start
//
//	matches:
//  	- "*://steamcommunity.com/id/*/inventory*"
//	run_at: "document_end"
//	all_frames: false
//
//inject-info-end

let { log, error } = require('./utils/logger').init('inventory-sell.js'),
	{ $ } = require('./utils/dom');


global.app = new App();
function App() {
	document.addEventListener('click', () => {
		let cb = $(`#market_sell_dialog_accept_ssa`).expect(1).get();
		cb.checked = true;
	});

	// 获取价格
	// fetch('http://steamcommunity.com/market/listings/753/566020-Game%20Within%20A%20Game%20(Profile%20Background)').then(function (response) {
	// 	return response.text();
	// }).then(function (text) {
	// 	console.log(text)
	// 	});
	
	
}

//inject-info-start
//
//	matches:
//  	- "*://steamcommunity.com/market/listings/*"
//	run_at: "document_end"
//	all_frames: false
//
//inject-info-end

let { log, error } = require('./utils/logger').init('market-buy-item.js'),
	{ $, appendDivInElement } = require('./utils/dom');


global.app = new App();
function App() {

	let block = $('.market_commodity_orders_header').expect(2).get();
	let btn = $(`.market_commodity_buy_button`, block).expect(1).get();
	btn.className = btn.className.replace('btn_green_white_innerfade', 'btn_grey_white_innerfade');

	let buy5btn = document.createElement('a');
	buy5btn.innerHTML = `<span>购买 5 件</span>`;
	buy5btn.className = 'btn_green_white_innerfade btn_medium market_commodity_buy_button';
	buy5btn.style.marginBottom = '-20px';
	block.insertBefore(buy5btn, btn);
	
	btn.addEventListener('click', () => {
		clickConfirmCheckBox();
	});
	buy5btn.addEventListener('click', () => {
		btn.dispatchEvent(new Event('click'));

		let pac = getPricesAndCounts();
		log('sale price info:', pac);
		let price = calc(pac);
		log('price info:', price);
		inputPriceAndCount(price.high, 5);
		appendTip(price);
	});

	
	function appendTip({ base, price, high }) {
		let recommend = high < base * 1.5;
		let infoHTML = `<div style="margin-top: 10px;background: white;padding: 10px;font-size: 30px;
			color: ${recommend ? 'green' : 'red'};">
			最低价格: ${base.toFixed(2)} 预期总价: ${price.toFixed(2)} ${recommend ? "推荐购买" : "不推荐!!"}
			</div>`;
		
		let container = $(`#market_buyorder_dialog_paymentinfo_bottomactions`).expect(1).get();
		appendDivInElement(container, infoHTML);
	}

	function inputPriceAndCount(price, count) {
		setTimeout(() => {
			let input = $(`#market_buy_commodity_input_price`).expect(1).get();
			input.value = String(price);

			let input2 = $(`#market_buy_commodity_input_quantity`).expect(1).get();
			input2.value = String(count);

			input.dispatchEvent(new Event('keyup'));
			input.dispatchEvent(new Event('blur'));
			input2.dispatchEvent(new Event('keyup'));
			input2.dispatchEvent(new Event('blur'));

		}, 50);
	}
	function clickConfirmCheckBox() {
		setTimeout(() => {
			let cb = $(`#market_buyorder_dialog_accept_ssa`).expect(1).get();
			cb.checked = true;
		}, 50);
	}
	function getPricesAndCounts() {
		let block = $(`#market_commodity_forsale_table`).expect(1).get();
		/** @type {string} */
		let pacStr = block.innerText || '';
		let pac = pacStr.trim().split('\n').slice(1).filter(v => v)
			.map(line => {
				let its = line.split(/\s+/).slice(1);
				return [parseFloat(its[0]), parseFloat(its[its.length - 1])];
			});
		return pac;
	}
	
	function calc(pricesAndCounts = []) {
		let [basePrice, baseCount] = pricesAndCounts[0];
		let totalPrice = 0, need = 5, high = basePrice;
		for (let [price, count] of pricesAndCounts) {
			high = price;
			if (count < need) {
				totalPrice = price * count;
				need -= count;
				continue;
			}
			totalPrice = price * need;
			need = 0;
			break;
		}
		return { base: basePrice, price: totalPrice, high };
	}

}

let log = require('./utils/logger').create('buy-five-cards.js');

global.app = new App();
function App() {

	const BLOCK_SELECTOR = `.market_commodity_orders_header`;
	let blocks = $(BLOCK_SELECTOR);
	notEqual2fatal(blocks.length, 2, `Steam购买出售框(${BLOCK_SELECTOR})不等于2个`);

	const BTN_SELECTOR = `.market_commodity_buy_button`;
	let btns = $(BTN_SELECTOR, blocks[0]);
	notEqual2fatal(btns.length, 1, `Steam购买按钮(${BTN_SELECTOR})不等于1个`);
	
	btns[0].addEventListener('click', () => {
		let pac = getPricesAndCounts();
		log('sale price info:', pac);
		let price = calc(pac);
		log('price info:',price);
		clickConfirmCheckBox();
		inputPriceAndCount(price.high, 5);
		appendTip(price);
	})

	function appendTip({ base, price, high }) {
		let div = document.createElement('div');
		let recommend = high < base * 1.5;
		div.innerHTML = `<div style="margin-top: 10px;background: white;padding: 10px;font-size: 30px;
			color: ${recommend ? 'green' : 'red'};">
			最低价格: ${base.toFixed(2)} 预期总价: ${price.toFixed(2)} ${recommend ? "推荐购买" : "不推荐!!"}
			</div>`;
		
		const SELECTOR = `#market_buyorder_dialog_paymentinfo_bottomactions`;
		let container = $(SELECTOR);
		notEqual2fatal(container.length, 1, `购买对话框底部信息框(${SELECTOR})不等于1个`);
		container[0].appendChild(div);
	}

	function inputPriceAndCount(price, count) {
		setTimeout(() => {
			const PRICE_INPUT_SELECTOR = `#market_buy_commodity_input_price`;
			let inputs = $(PRICE_INPUT_SELECTOR);
			notEqual2fatal(inputs.length, 1, `Steam购买价格文本框(${PRICE_INPUT_SELECTOR})不等于1个`);
			inputs[0].value = String(price);

			const COUNT_INPUT_SELECTOR = `#market_buy_commodity_input_quantity`;
			let inputs2 = $(COUNT_INPUT_SELECTOR);
			notEqual2fatal(inputs2.length, 1, `Steam购买数量文本框(${COUNT_INPUT_SELECTOR})不等于1个`);
			inputs2[0].value = String(count);

			inputs[0].dispatchEvent(new Event('keyup'));
			inputs[0].dispatchEvent(new Event('blur'));
			inputs2[0].dispatchEvent(new Event('keyup'));
			inputs2[0].dispatchEvent(new Event('blur'));
		}, 50);
	}
	function clickConfirmCheckBox() {
		setTimeout(() => {
			const CHECK_BOX_SELECTOR = `#market_buyorder_dialog_accept_ssa`;
			let cbs = $(CHECK_BOX_SELECTOR);
			notEqual2fatal(btns.length, 1, `Steam购买确认复选框(${CHECK_BOX_SELECTOR})不等于1个`);
			cbs[0].checked = true;
		}, 50);
	}
	function getPricesAndCounts() {
		const BLOCK_SELECTOR = `#market_commodity_forsale_table`;
		let blocks = $(BLOCK_SELECTOR);
		notEqual2fatal(blocks.length, 1, `Steam价格框(${BLOCK_SELECTOR})不等于1个`);
		/** @type {string} */
		let pacStr = blocks[0].innerText || '';
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

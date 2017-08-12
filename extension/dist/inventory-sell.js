(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
extLog('inventory-sell.js');
let app = new App();
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
};
function extLog(...p) {  console.log('steam-web-scripts', ...p); }

},{}]},{},[1]);

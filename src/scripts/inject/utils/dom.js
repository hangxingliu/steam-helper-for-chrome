//@ts-check
/// <reference path="utils.d.ts" />

let logger = require('./logger');

/**
 * @param {string} [selector=''] 
 * @param {any} base 
 * @returns {DOMQueryResultInstance}
 */
function $(selector = '', base = null) {
	let domArray = (base || document).querySelectorAll(selector);
	return new DOMQueryResult(selector, domArray);
}

function DOMQueryResult(selector = '', domArray = []) {
	let thiz = this, _name = '';
	this.name = (name = '') => {
		_name = name;
		return thiz;
	};
	this.expect = (...num) => {
		if (num.length == 1)
			if (domArray.length != num[0])
				return error(`expect count is ${num[0]}`);
		if (num.length == 2)
			if (domArray.length < num[0] || domArray.length >= num[1])
				return error(`expect count is [${num[0]}, ${num[1]})`);
		return thiz;
	};
	this.get = (offset = 0) => domArray[offset];
	function error(description = '') {
		description = `Query DOM failed, (` +
			`${_name ? ('Name: ' + _name + ' ') : ''}Selector: ${selector}, Count: ${domArray.length}) ` +
			description;
		logger.error(description);
		throw description;
	}
}

/** @param {Element} element */
function appendDivInElement(element, divInnerHTML = '') {
	let div = document.createElement('div');
	div.innerHTML = divInnerHTML;
	element.appendChild(div);
	return element;
}

/** @param {Element} element */
function prependDivInElement(element, divInnerHTML = '') {
	let div = document.createElement('div');
	div.innerHTML = divInnerHTML;
	if (element.firstChild)
		element.insertBefore(div, element.firstChild);
	else
		element.appendChild(div);
	return element;
}

module.exports = {
	$, appendDivInElement, prependDivInElement
};
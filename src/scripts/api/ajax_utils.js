//@ts-check
/// <reference path="./api.d.ts" />

export const x_www_form_urlencoded = 'application/x-www-form-urlencoded; charset=UTF-8';

/**
 * @param {string} method
 * @param {string} url 
 * @param {any} data 
 * @param {string} [sendDataType] Request Body Content-type
 * @returns {Promise<string>}
 */
export function ajax(method, url, data = null, sendDataType = '') { 
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
		if (sendDataType)
			xhr.setRequestHeader("Content-type", sendDataType);
		xhr.onload = () => {
			if (xhr.readyState != 4 || xhr.status != 200)
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);
			resolve(xhr.responseText);
		}
		xhr.onerror = (err) => reject(err);
		xhr.send(data);
	});
}

/**
 * @param {string} method
 * @param {string} url 
 * @param {any} data 
 * @param {string} [sendDataType] Request Body Content-type
 * @returns {Promise<any>}
 */
export function ajaxJSON(method, url, data = null, sendDataType = '') { 
	return ajax(method, url, data, sendDataType).then(body => {
		try {
			return Promise.resolve(JSON.parse(body));
		} catch (ex) { 
			return Promise.reject(`Invalid JSON object: ${url}`);
		}
	});
}

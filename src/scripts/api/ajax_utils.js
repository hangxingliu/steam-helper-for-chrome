//@ts-check
/// <reference path="./api.d.ts" />

/**
 * @param {string} method
 * @param {string} url 
 * @param {any} data 
 * @returns {Promise<string>}
 */
export function ajax(method, url, data = null) { 
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.open(method, url);
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
 * @returns {Promise<any>}
 */
export function ajaxJSON(method, url, data = null) { 
	return ajax(method, url, data).then(body => {
		try {
			return Promise.resolve(JSON.parse(body));
		} catch (ex) { 
			return Promise.reject(`Invalid JSON object: ${url}`);
		}
	});
}
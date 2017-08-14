//@ts-check
const KEY = {
	USERNAME: 'steam_username'
}
let store = null;

function storeDataToBrowser(data) {
	if (data.username != get(KEY.USERNAME)) {
		set(KEY.USERNAME, data.username);
		console.log(`Update ${KEY.USERNAME} in localStorage to: ${data.username}`);
	}
}

function create(reducer) {
	if (store) return store;
	
	store = require('redux').createStore(reducer, getReduxDebugger());
	store.subscribe(() => storeDataToBrowser(store.getState()));
	return store;
}
function getReduxDebugger() {
	//@ts-ignore
	return window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
}

function get(key) {
	let value = localStorage.getItem(key);
	return typeof value == 'string' ? JSON.parse(value) : void 0;
}
function set(key, value) { 
	localStorage.setItem(key, JSON.stringify(value));
}

module.exports = {
	create,
	getReadOnlyState: () => store ? store.getState() : ({}),
	browserStorage: {
		get username() { return get(KEY.USERNAME) || '' }
	}
};
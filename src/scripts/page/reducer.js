
let { NAME } = require('./action');
let Store = require('./store'),
	{ browserStorage } = Store;
let { combineReducers } = require('redux');


let links = require('./get-default-links'),
	getLinks = (username) =>
		links.map(({ url, title, side }) =>
			({ title, side, url: url.replace('{}', username) }));


function page(state = 'index', action) {
	switch (action.type) {
		case NAME.SWITCH_PAGE:
			return action.page;
	}
	return state;
}
  
function indexLinks(state = null, action) {
	if(action.type == NAME.UPDATE_INDEX_LINKS || !state) {
		return getLinks(Store.getReadOnlyState().username || browserStorage.username);
	}
	return state;
}

function username(username = undefined, action) {
	if (action.type == NAME.UPDATE_USERNAME)
		return action.username;

	// Init
	if (typeof username == 'undefined')
		return browserStorage.username;
	
	return username;
}

function notification(notification = {}, action) {
	if (action.type == NAME.NOTIFICATION)
		return Object.assign({}, action);
	return notification;
}

module.exports = combineReducers({
	page,
	indexLinks,
	username,
	notification
});

const NAME = {
	SWITCH_PAGE: 'switch_page',
	UPDATE_INDEX_LINKS: 'update_links',
	NOTIFICATION: 'notify',
	UPDATE_USERNAME: 'username'
};

const creator = {
	switchPage: (page) => createAction(NAME.SWITCH_PAGE, { page }),
	updateIndexLinks: () => createAction(NAME.UPDATE_INDEX_LINKS, {}),
	showNotification: (text, style) => createAction(NAME.NOTIFICATION, { enable: true, text, style }),
	hideNotification: () => createAction(NAME.NOTIFICATION, { enable: false }),
	updateUsername: (username) => createAction(NAME.UPDATE_USERNAME, { username }),
}; 


module.exports = Object.assign({ NAME }, creator);

function createAction(type, params) { return Object.assign({ type }, params); }

//@ts-check

const PREFIX = 'Steam Helper:';

function log(...p) {
	//eslint-disable-next-line no-console
	console.log(PREFIX, ...p);
}

function create(injectScriptName) {
	log(`${injectScriptName} has been injected!`);
	return log;
}

module.exports = { create };


#!/usr/bin/env node

let fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml');

const SRC = `${__dirname}/../src`;
const DIST = `${__dirname}/../extension`;

const PACKAGE_JSON = `${__dirname}/../package.json`;

const MANIFEST_BASE_FILE = `${SRC}/manifest.base.json`;
const MANIFEST_TARGET_FILE = `${DIST}/manifest.json`;

const INJECT_SCRIPTS_DIR = `scripts/inject`;

(function main() {
	console.log('  Building manifest.json for extension ... ');

	let manifest = readJSON(MANIFEST_BASE_FILE);
	manifest.version = getVersion();
	manifest.content_scripts = getInjectScriptsInfo();
	writeJSON(MANIFEST_TARGET_FILE, manifest);
	
	console.log('  Version info:', manifest.version);
	console.log('  Inject scripts count: ', manifest.content_scripts.length);
	console.log('  Build done!');
})();

function getInjectScriptsInfo() {
	return fs.readdirSync(`${SRC}/${INJECT_SCRIPTS_DIR}`)
		.filter(fname => fname.endsWith('.js'))
		.map(fname => getInjectInfoFromFile(`${SRC}/${INJECT_SCRIPTS_DIR}/${fname}`));
}
function getInjectInfoFromFile(filePath) {
	let relativePath = path.relative(SRC, filePath);
	let lines = fs.readFileSync(filePath, 'utf8').split(/[\n\r]+/);
	let start = false;
	let yamlStr = '';
	for (let line of lines) {
		if (!line.startsWith('//')) continue;
		if (line.indexOf('inject-info-end') >= 0) break;
		if (line.indexOf('inject-info-start') >= 0)
			start = true;
		else if (start)
			yamlStr += '\n' + line.replace('//', '');
	}
	yamlStr = yamlStr.replace(/\t/g, '    ');
	return Object.assign({}, yaml.safeLoad(yamlStr), { js: [relativePath] });
}

function getVersion() { return readJSON(PACKAGE_JSON).version; }

function readJSON(file) {
	// And remove comments
	return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\s*\/\/.+$/gm, ""));
}
function writeJSON(file, object) {
	return fs.writeFileSync(file, JSON.stringify(object, null, '\t'));
}
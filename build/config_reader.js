/**
 * frontend build scripts
 * version: 0.6.0
 * date: 2017-08-14 01:28
 */

//@ts-check
/// <reference path="type.d.ts" />

(function () {
	const DEFAULT = {
		WATCHIFY: { delay: 100, ignoreWatch: ['**/node_modules/**'], poll: false }
	};

	const VALID_SYNC_HOOKS = ['before_all', 'after_build'];
	const HOOK_ASYNC_PREFIX = 'async_';

	const VALID_ASYNC_HOOKS = VALID_SYNC_HOOKS.map(name => HOOK_ASYNC_PREFIX + name);
	const VALID_HOOKS = [].concat(VALID_ASYNC_HOOKS, VALID_SYNC_HOOKS);

	let yaml = require('js-yaml'),
		{ readFileSync } = require('fs-extra'),
		{ join: joinPath } = require('path');
	
	/**
	 * @param {string} filePath
	 * @returns {ConfigObject}
	 */
	function reader(filePath) {
		let configStr = readFileSync(filePath, 'utf8'),
			config = yaml.safeLoad(configStr);
		
		if (!isString(config.name))
			throw incompleteError(`config.name`, 'String');
		
		if (!isObject(config.src))
			throw incompleteError(`config.src`, 'Object');
		if (!isString(config.src.base))
			throw incompleteError(`config.src.base`, 'String');
		
		if (isNull(config.src.scripts)) config.src.scripts = [];
		if (isNull(config.src.styles)) config.src.styles = [];
		if (!isStringOrStringArray(config.src.scripts))
			throw incompleteError(`config.src.scripts`, 'String/String[]');
		if (!isStringOrStringArray(config.src.styles))
			throw incompleteError(`config.src.styles`, 'String/String[]');
		
		if (isObject(config.src.concat))
			Object.keys(config.src.concat).map(key => {
				if (!isStringArray(config.src.concat[key]))
					throw incompleteError(`config.src.concat["${key}"]`, 'string[]');
			});
		
		if (isObject(config.hook))
			Object.keys(config.hook).map(hookName => {
				if (VALID_HOOKS.indexOf(hookName) < 0) throw incompleteError(`config.hook["${hookName}"]`, `valid hook event name`);
				if (!isString(config.hook[hookName]))
					throw incompleteError(`config.hook["${hookName}"]`, `string`);
			})

		if (isNull(config.src.assets)) config.src.assets = [];
		if (isNull(config.src.pages)) config.src.pages = [];
		if (!isStringOrStringArray(config.src.assets))
			throw incompleteError(`config.src.assets`, 'String/String[]');
		if (!isStringOrStringArray(config.src.pages))
			throw incompleteError(`config.src.pages`, 'String/String[]');

		if (!isObject(config.dist))
			throw incompleteError(`config.dist`, 'Object');
		if (!isString(config.dist.base))
			throw incompleteError(`config.dist.base`, 'String');
		if (!isBoolean(config.dist.clean))
			throw incompleteError(`config.dist.clean`, 'Boolean');

		let basePath = process.cwd(),
			distBasePath = joinPath(basePath, config.dist.base),
			srcBasePath = joinPath(basePath, config.src.base);

		/**
		 * @type {ConfigObject}
		 */
		//@ts-ignore
		let result = {};

		result.name = config.name;
		result.src = srcBasePath;
		result.dist = distBasePath;
		result.clean_dist = !!config.dist.clean;

		let assetsConfig = config.src.assets;
		result.src_assets = (isString(assetsConfig) ? [assetsConfig] : assetsConfig)
			.map(path => ({ name: path, from: joinPath(srcBasePath, path), to: joinPath(distBasePath, path) }));
		
		let pagesConfig = config.src.pages;
		result.src_globs = (isString(pagesConfig) ? [pagesConfig] : pagesConfig);
		
		let scriptsConfig = config.src.scripts;
		result.src_script_globs = (isString(scriptsConfig) ? [scriptsConfig] : scriptsConfig);
		let stylesConfig = config.src.styles;
		result.src_styles_globs = (isString(stylesConfig) ? [stylesConfig] : stylesConfig);
		
		let concatConfig = config.src.concat || {};
		result.concat = Object.keys(concatConfig).map(distFileName => ({
			name: distFileName,
			to: joinPath(distBasePath, distFileName),
			from: concatConfig[distFileName].map(srcFileName => joinPath(srcBasePath, srcFileName))
		}));

		let hookConfig = config.hook || {},
			hookResult = {};
		Object.keys(hookConfig).map(hookName => {
			hookResult[hookName.replace(HOOK_ASYNC_PREFIX, '')] = {
				command: hookConfig[hookName],
				asynchronous: hookName.startsWith(HOOK_ASYNC_PREFIX)
			};
		});
		result.hook = hookResult;

		/**
		 * @type {ProcessorConfigObject}
		 */
		//@ts-ignore
		let processor = {};
		let configProcessor = config.processor || {};
		
		processor.sass = { enable: !!configProcessor.sass };
		processor.less = { enable: !!configProcessor.less };
		processor.autoprefixer = { enable: !!configProcessor.autoprefixer };
		processor.ejs = { enable: !!configProcessor.ejs };
		processor.pug = { enable: !!configProcessor.pug };

		processor.watchify = Object.assign({}, DEFAULT.WATCHIFY, configProcessor.watchify || {});
		if (processor.watchify.enable === false)
			throw incompleteError(`processor.watchify.enable`, 'true/undefined');
		delete processor.watchify.enable;

		processor.source_map = isObjectHasEnableField(configProcessor.source_map)
			? configProcessor.source_map
			: { enable: !!configProcessor.source_map };
		processor.html_minifier = isObjectHasEnableField(configProcessor.html_minifier)
			? configProcessor.html_minifier
			: { enable: !!configProcessor.html_minifier };
		processor.browser_sync = isObjectHasEnableField(configProcessor.browser_sync)
			? configProcessor.browser_sync
			:{ enable: !!configProcessor.browser_sync };
		processor.babel = isObjectHasEnableField(configProcessor.babel)
			? configProcessor.babel
			:{ enable: !!configProcessor.babel };
		processor.ejs_variables =
			isObjectHasEnableField(configProcessor.ejs_variables)
				? configProcessor.ejs_variables
				: { enable: !!configProcessor.ejs_variables };
		processor.ejs_template_tags = isObjectHasEnableField(configProcessor.ejs_template_tags)
			? configProcessor.ejs_template_tags
			: { enable: !!configProcessor.ejs_template_tags };
			
		result.processor = processor;
		return result;
	
	}
	
	function isNull(obj) { return !obj && typeof obj == 'object'; }
	function isObject(obj) { return obj && typeof obj == 'object'; }
	function isString(obj) { return typeof obj == 'string'; }
	function isBoolean(obj) { return typeof obj == 'boolean'; }
	function isStringArray(obj) { 
		if (!Array.isArray(obj)) return false;
		for (let it of obj) if (typeof it != 'string') return false;
		return true;
	}
	function isStringOrStringArray(obj) { return isString(obj) || isStringArray(obj); }
	function incompleteError(name, type) {
		return new Error(`Config is incomplete. "${name}" is not a ${type}!`);
	}
	function isObjectHasEnableField(obj) { return isObject(obj) && isBoolean(obj.enable); }
	
	module.exports = { read: reader };
})();
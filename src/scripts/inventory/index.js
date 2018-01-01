//@ts-check
/// <reference path="../api/api.d.ts" />

import React from 'react';
import ReactDOM from 'react-dom';

import { Header } from './components/Header';
import { getCurrentUserOverviewWithCache, listAllInventoryWithCache, clearSteamCache } from '../api/inventory';
import { MainContainer } from './components/MainContainer';
import { iterateInventory, getInventoryTagsManager, filterInventoryByRules } from '../api/inventory_operator';
import { ButtonsUnderHeader } from './components/ButtonsUnderHeader';
import { LoadError } from './components/LoadError';
import { renderReactComponent } from './utils';
import { queryMarketPrices, queryMarketPricesOnlyFromCache, getPriceQueryQueueLength, PRICE_API_LIMIT_PER_MINUTE, getLast429Timestamp } from '../api/inventory_price';

const pageSize = 25;

/** @type {SteamUserInventoryOverview} */
let overviewInfo = null;

/** @type {SteamInventoryCategory} */
let category = null;
/** @type {SteamInventoryCategoryContext} */
let categoryContext = null;

/** @type {SteamInventories} */
let inventories = null;
/** @type {SteamInventories} */
let filteredInventories = null;
/** @type {string} */
let inventoriesLoading = null;

let selectedItem = null;
let selectedDescription = null;

/** @type {SteamInventoryTagsManager} */
let inventoryTags = null;
let filter = { tags: {}, keyword: ''};

let currentPage = 1;
let _getTotalPage = inv => inv ? Math.ceil(inv.totalCount / pageSize) : 1;
let getTotalPage = () => _getTotalPage(filteredInventories || inventories);

let error = null;

updateUI()
	.then(() => getCurrentUserOverviewWithCache())
	.then(overview => {
		console.log(`CurrentUserOverview: {userName: ${overview.userName},` +
			`steamID: ${overview.steamID}, strLanguage: ${overview.strLanguage}}`);
		overviewInfo = overview;
		return updateUI();
	})
	.then(() => {
		if (overviewInfo.needLogin)
			return Promise.reject(`Please login Steam firstly!`);
		category = overviewInfo.category.filter(c => c.appid == '753')[0]; // Steam
		categoryContext = category.context.filter(c => c.id == '6')[0]; // Community
		return Promise.resolve();
	})
	.then(() => listAllInventoryWithCache(overviewInfo.steamID, category.appid, categoryContext.id,
		overviewInfo.strLanguage, (now, total) => {
			inventoriesLoading = `${now} / ${total}`;
			return updateUI();
		}))
	.then(_inventories => {
		inventories = _inventories;
		inventoriesLoading = null;
		
		console.log(`GotAllInventory: {totalCount: ${inventories.totalCount}, ` +
			`segmentCount: ${inventories.segments.length}}`);
		return updateUI();
	})
	.then(() => {
		console.log(inventoryTags = getInventoryTagsManager(inventories))
		return updateUI();
	})
	.catch(catchException);

function onClickClearCache() {  clearSteamCache().then(() => location.reload()).catch(catchException); }

function onClickSwitchPage(page = 1) { currentPage = page; return updateUI(); }
function onClickInventory(item, desc) {
	selectedItem = item;
	selectedDescription = desc;
	queryMarketPrices([{ appId: desc.appid, marketHashName: desc.market_hash_name }],
		overviewInfo.wallet,
		(results) => { void results; return updateUI() },
		(ex) => console.error(ex),
		{ justNow: true, noCache: true });
	return updateUI();
}
function onFilterUpdate(newFiler) {
	currentPage = 1; // reset page to 1
	filter = newFiler;
	inventoriesLoading = 'Filtering inventories ...';
	return updateUI().then(() => { 
		filteredInventories = filterInventoryByRules(inventories, filter);
		inventoriesLoading = null;
		return updateUI();
	}).catch(catchException);
}


function catchException(ex) { 
	error = ex ? (ex.message || ex) : 'Unknown exception!';
	console.error(`Catch Exception: ${error}`);
	console.error(ex);
	if (ex && ex.stack)
		console.error(ex.stack);
	updateUI();
}

function updateUI() {

	if (!overviewInfo)
		return renderReactComponent(<div>
			<Header nickName="Loading..."></Header>
			{error ? <LoadError reason={error} /> : ''}
		</div>);

	let { nickName, userName, avatar, steamID, needLogin } = overviewInfo;
	if (needLogin) {
		nickName = '你还没有登录!';
	}

	// choose inventory to display
	/** @type {SteamInventoryItem[]} */
	let items = [];
	/** @type {SteamInventoryItemDescription[]} */
	let descriptions = [];

	iterateInventory(filteredInventories || inventories, (index, item, desc) => {
		items.push(item);
		descriptions.push(desc);
		return true;
	}, (currentPage - 1) * pageSize, currentPage * pageSize);// one page

	// show price from cache
	let query = descriptions.map(it => ({ appId: String(it.appid), marketHashName: it.market_hash_name }));
	return queryMarketPricesOnlyFromCache(query)
		.then(({ results, missing }) => {
			// merge price info on descriptions
			let map = {};
			for (let result of results)
				map[newInventorySymbol(result)] = result;
			
			console.log(results);
			descriptions = descriptions.map(desc => Object.assign(
				{ marketPrice: map[newInventorySymbol(desc)] || undefined }, desc));
			
			// automatic queue
			let queueLength = getPriceQueryQueueLength();
			let last429 = getLast429Timestamp();
			console.log(`missing price query length: ${missing.length}; ` +
				`query queue length: ${getPriceQueryQueueLength()}; ` +
				`last "429" time: ${last429?new Date(last429).toLocaleTimeString():null}`);
			
			if (last429 < (Date.now() - 60 * 1000) &&	
				missing.length > 0 && queueLength == 0 && 
				missing.length < PRICE_API_LIMIT_PER_MINUTE) { 

				console.log(`Start query prices automatically ...`);
				queryMarketPrices(missing, overviewInfo.wallet,
					(results) => { void results; return updateUI() },
					(ex) => console.error(ex), {});
			}

			return true;
		}).then(() => renderReactComponent(
			// main html render >>>
			<div>
				<Header nickName={nickName} userName={userName} avatar={avatar}
					steamID={steamID} needLogin={needLogin}></Header>
				<ButtonsUnderHeader onClickClearCache={onClickClearCache}></ButtonsUnderHeader>
				<MainContainer {...{
					items, descriptions,
					pageSize,
					inventoriesLoading, error,
					inventoryTags,
					selectedItem, selectedDescription,
					filter, onFilterUpdate
				}}
					categories={overviewInfo.category}
					categorySelected={category}
					page={currentPage} totalPage={getTotalPage()}
					onSwitchPage={onClickSwitchPage}
					onClickInventory={onClickInventory}

					priceLoadingCount={getPriceQueryQueueLength()}
				></MainContainer>
			</div>)
		);
}

/** @param {{appId?: string; marketHashName?: string; appid?: number; market_hash_name?: string}} inv */
function newInventorySymbol(inv) { 
	if (inv.market_hash_name)
		return JSON.stringify([String(inv.appid), inv.market_hash_name]);
	return JSON.stringify([inv.appId, inv.marketHashName]);
}


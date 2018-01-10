//@ts-check
/// <reference path="../api/api.d.ts" />

import React from 'react';

import { Header } from './components/Header';
import { listAllInventoryWithCache } from '../api/inventory';
import { getUserOverview } from "../api/user_overview";
import { MainContainer } from './components/MainContainer';
import { iterateInventory, getInventoryTagsManager, filterInventoryByRules } from '../api/inventory_operator';
import { ButtonsUnderHeader } from './components/ButtonsUnderHeader';
import { LoadError } from './components/LoadError';
import { renderReactComponent } from './utils';
import {
	queryMarketPrices,
	queryMarketPricesOnlyFromCache,
	getPriceQueryQueueLength,
	PRICE_API_LIMIT_PER_MINUTE,
	getLast429Timestamp
} from '../api/inventory_price';
import { logUserOverview, logInventories } from './log';
import { isInventoryHasGems, queryInventoryGemsByDescription, convertInventoryToGems } from '../api/inventory_to_gem';
import { showDialog, getDialogCancelBtn, getDialogOKButton } from './components/dialog';
import { Dialog } from './components/Dialog';
import { LoadingDialog } from './components/LoadingDialog';
import { HTMLBodyDialog } from './components/HTMLBodyDialog';
import { ErrorDialog } from './components/ErrorDialog';
import { refreshCache } from '../api/database/core';
import { SettingsDialog } from './components/SettingsDialog';

const pageSize = 25;

/** @type {SteamUserOverview} */
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

(function main() {
	updateUI()
		.then(() => getUserOverview())
		.then(overview => {
			logUserOverview(overviewInfo = overview);

			// if need login
			if (overviewInfo.needLogin)
				return Promise.reject(`Please login Steam firstly!`);
			
			// if this overview is cached, get latest overview async (to keeping sessionId is correct)
			if (overviewInfo.fromCache)
				fetchLatestUserOverviewAsync();
			
			category = overviewInfo.category.filter(c => c.appid == '753')[0]; // Steam
			categoryContext = category.context.filter(c => c.id == '6')[0]; // Community
			
			return updateUI();
		})
		.then(fetchAndDisplayInventories)
		.catch(onCatchException);
})();

function fetchLatestUserOverviewAsync() { 
	getUserOverview(false)
		.then(info => logUserOverview(overviewInfo = info))
		.catch(onCatchException);
}

function fetchAndDisplayInventories() {
	return listAllInventoryWithCache(overviewInfo.steamID, category.appid, categoryContext.id,
		overviewInfo.strLanguage, (now, total) => {
			inventoriesLoading = `${now} / ${total}`;
			return updateUI();
		}).then(_inventories => {
			inventories = _inventories;
			inventoriesLoading = null;
			
			logInventories(inventories);
			return updateUI();
		}).then(() => {
			console.log(inventoryTags = getInventoryTagsManager(inventories))
			return updateUI();
		});
}

function onClickClearCache() {
	refreshCache()
		.then(() => location.reload())
		.catch(onCatchException);
}

function onClickSwitchPage(page = 1) {
	currentPage = page;
	return updateUI();
}

function onClickInventory(item, desc) {
	selectedItem = item;
	selectedDescription = desc;
	queryMarketPrices([{ appId: desc.appid, marketHashName: desc.market_hash_name }],
		overviewInfo.wallet,
		(results) => { void results; return updateUI() },
		(ex) => console.error(ex),
		{ justNow: true, noCache: true });
	
	if (isInventoryHasGems(desc))
		queryInventoryGemsByDescription(desc)
			.then(info => { selectedDescription.gems = info.gems; return updateUI(); })
			.catch(onCatchException);
	
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
	}).catch(onCatchException);
}

function onClickInventoryToGems(item, description) { 
	let { name, gems } = description;
	showDialog(<Dialog title={"将 " + name + " 转换为宝石吗?"}
		body={<span>{name} 价值 <b>{gems}</b> 个宝石。您要将该物品转化成宝石吗？此操作无法取消。</span>}
		buttons={[getDialogOKButton(() => {
			
			showDialog(<LoadingDialog title="宝珠兑换中" message={`将 ${name} 兑换成 ${gems} 个宝珠 ...`} />)
				.then(() => convertInventoryToGems(overviewInfo, item, gems))
				.then(result => showDialog(<HTMLBodyDialog title="兑换成功" htmlBody={result} />))
				.catch(showErrorDialog);

		}), getDialogCancelBtn()]}/>)
}

function showErrorDialog(ex) { 
	let description = ex, code = '';
	if (ex.message) {
		description = ex.message;
		code = ex.stack || '';
	} else if (ex.error) { 
		description = ex.error;
	}
	console.error(`Catch Exception: ${description}`);
	console.error(ex);
	return showDialog(<ErrorDialog {...{ title: "错误", description, code }} />);
}
function onCatchException(ex) { 
	error = ex ? (ex.message || ex) : 'Unknown exception!';
	console.error(`Catch Exception: ${error}`);
	console.error(ex);
	if (ex && ex.stack)
		console.error(ex.stack);
	updateUI();
}

/** @returns {Promise} */
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
			
			// console.log(results);
			descriptions = descriptions.map(desc => Object.assign(
				{ marketPrice: map[newInventorySymbol(desc)] || undefined }, desc));
			
			// automatic queue
			let queueLength = getPriceQueryQueueLength();
			let last429 = getLast429Timestamp();
			// console.log(`missing price query length: ${missing.length}; ` +
			// 	`query queue length: ${getPriceQueryQueueLength()}; ` +
			// 	`last "429" time: ${last429?new Date(last429).toLocaleTimeString():null}`);
			
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
					steamID={steamID} needLogin={needLogin} />
				<ButtonsUnderHeader
					onClickClearCache={onClickClearCache}/>
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

					actionsHandler={{toGems: onClickInventoryToGems}}

					priceLoadingCount={getPriceQueryQueueLength()}
				/>
			</div>)
		);
}

/** @param {{appId?: string; marketHashName?: string; appid?: number; market_hash_name?: string}} inv */
function newInventorySymbol(inv) { 
	if (inv.market_hash_name)
		return JSON.stringify([String(inv.appid), inv.market_hash_name]);
	return JSON.stringify([inv.appId, inv.marketHashName]);
}


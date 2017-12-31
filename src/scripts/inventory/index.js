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
function onClickInventory(item, desc) { selectedItem = item; selectedDescription = desc; return updateUI(); }
function onFilterUpdate(newFiler) {
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
			{error ? <LoadError reason={error} />: ''}
		</div>);

	let { nickName, userName, avatar, steamID, needLogin } = overviewInfo;
	if (needLogin) { 
		nickName = '你还没有登录!';
	}

	// choose inventory to display
	let items = [], descriptions = [];
	iterateInventory(filteredInventories || inventories, (index, item, desc) => {
		items.push(item);
		descriptions.push(desc);
		return true;
	}, (currentPage - 1) * pageSize, currentPage * pageSize);// one page

	return renderReactComponent(
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
			></MainContainer>
		</div>);
}


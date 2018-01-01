//@ts-check
/// <reference path="../../api/api.d.ts" />

import React from 'react';
import { InventoryItem } from './InventoryItem';
import { InventoryRightSide } from './InventoryRightSide';

/** @type {SteamInventoryItem[]} */
const DEFAULT_ITEM_ARRAY = [];
/** @type {SteamInventoryItemDescription[]} */
const DEFAULT_DESC_ARRAY = [];

/** @type {SteamInventoryCategory} */
const DEFAULT_CATEGORY = null;

const DEFAULT_PAGE_SWITCHER = (newPage = 1) => void newPage;
const DEFAULT_CLICK_INVENTORY = (item, desc) => void desc;

export function Inventory({
	items = DEFAULT_ITEM_ARRAY,
	descriptions = DEFAULT_DESC_ARRAY,
	page = 1,
	pageSize = 25,
	totalPage = 1,
	category = DEFAULT_CATEGORY,

	selectedItem,
	selectedDescription,

	priceLoadingCount = 0,

	onSwitchPage = DEFAULT_PAGE_SWITCHER,
	onClickInventory = DEFAULT_CLICK_INVENTORY
}) {
	let blocks = items.map((item, i) => ({ item, desc: descriptions[i] }));
	for (let i = blocks.length; i < pageSize; i++)
		blocks.push({ item: null, desc: null });

	let hasLastPage = page > 1,
		hasNextPage = page < totalPage;
	return <div id="tabcontent_inventory">
		<div className="view_inventory_page" id="active_inventory_page">
			<InventoryRightSide 
				item={selectedItem || items[0]} 
				description={selectedDescription || descriptions[0]} 
				category={category} />
			<div className="inventory_page_left">
				<div className="trade_item_box selectableNone" id="inventories">
					<div className="inventory_ctn">
						<div className="inventory_page">
							{blocks.map((block, i) =>
								<InventoryItem key={i} {...block} onClick={onClickInventory}></InventoryItem>)}
						</div>
						<div style={{ clear: 'left' }}></div>
					</div>
				</div>
				<div id="inventory_pagecontrols">
					{priceLoadingCount > 0 ?
						<div className="price_info_loading">
							<span>价格信息加载中 (<b>{priceLoadingCount}</b>) ...	</span>
							<img src="https://steamcommunity-a.akamaihd.net/public/images/login/throbber.gif" />
						</div> : ''}

					<a className={"pagecontrol_element pagebtn " + (hasNextPage ? '' : 'disabled')} 
						onClick={hasNextPage ? () => onSwitchPage(page+1) : undefined}
						id="pagebtn_next"> &gt; </a>

					<div className="pagecontrol_element pagecounts">
						第 <span id="pagecontrol_cur">{page}</span> 页，共 <span id="pagecontrol_max">{totalPage}</span> 页 </div>

					<a className={"pagecontrol_element pagebtn " + (hasLastPage ? '' : 'disabled')} 
						onClick={hasLastPage ? () => onSwitchPage(page-1) : undefined}
						id="pagebtn_previous">&lt;</a>

					<div style={{ clear: 'right' }}></div>
				</div>
				<div style={{ clear: 'right' }}></div>
			</div>
		</div>
	</div>;
}
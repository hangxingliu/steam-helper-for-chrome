//@ts-check
/// <reference path="../../api/api.d.ts" />
/// <reference path="./components.d.ts" />

import React from 'react';
import { CategoryTabs } from './CategoryTabs';
import { Loading } from './Loading';
import { Inventory } from './Inventory';
import { LoadError } from './LoadError';
import { CategoryLogo } from './CategoryLogo';
import { getEmptyImageURL } from '../../api/image';
import { TagsFilter } from './TagsFilter';


/** @param {MainContainerComponent} props */
export function MainContainer(props) {
	let { 
		categorySelected, categories, inventoriesLoading, 
		items, descriptions, onClickInventory,
		pageSize, page, totalPage, onSwitchPage,
		selectedItem, selectedDescription,
		inventoryTags,
		onFilterUpdate, filter,
		actionsHandler,
		error
	} = props;

	return <div id="BG_bottom" className="maincontent">
		<div id="mainContents">
			<CategoryTabs category={categories} />
			<CategoryLogo logo={categorySelected ? categorySelected.image : getEmptyImageURL()} />
			
			{error ?
				<LoadError reason={error} /> : ''}

			{inventoriesLoading ?
				<Loading message={inventoriesLoading} /> : ''}

			{inventoryTags ?
				<TagsFilter tagsManager={inventoryTags}
					filter={filter} onFilterUpdate={onFilterUpdate} /> : ''}

			<Inventory {...{
				pageSize, page, totalPage, items, descriptions, onSwitchPage, onClickInventory, 
				selectedItem, selectedDescription,
				actionsHandler
			}}	
				category={categorySelected} />
		</div>
	</div>;
}
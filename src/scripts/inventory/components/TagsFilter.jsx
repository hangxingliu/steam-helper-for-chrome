//@ts-check
/// <reference path="../../api/api.d.ts" />
/// <reference path="./components.d.ts" />

import React from 'react';

/** @type {SteamInventoryTagsManager} */
const DEFAULT_TAGS_MANAGER = null;

/** @type {(newFilter: SteamInventoryFilter) => any} */
const DEFAULT_ON_FILTER_UPDATE = (newFilter) => void newFilter;

/** @type {SteamInventoryFilter} */
const DEFAULT_FILTER = { tags: {}, keyword: '' };

export function TagsFilter({
	tagsManager = DEFAULT_TAGS_MANAGER,
	hideGameGatrory = true,
	filter = DEFAULT_FILTER,
	onFilterUpdate = DEFAULT_ON_FILTER_UPDATE
}) {
	return <div className="addon_tag_filter_container">
		{Object.keys(tagsManager).map(k => tagsManager[k]).map(tagCategory => {
			if(hideGameGatrory && tagCategory.category == 'Game')
				return '';
			
			let isCategorySelected = tagCategory.category in filter.tags;
			let categoryFilter = filter.tags[tagCategory.category];

			let tags = tagCategory.tags;
			return <div key={tagCategory.category} className="addon_tag_filter_column">
				<div className="addon_tag_filter_title">{tagCategory.name}</div>
				<div className="addon_tag_filter_btns">
					{Object.keys(tags).map(k => tags[k]).map((tag, i) => {
						let isSelected = isCategorySelected && (tag.id in categoryFilter);

						return <a key={i} className={"addon_tag_filter_btn " + (isSelected ? "selected" : "")}
							onClick={toggleTagFilter.bind(this, onFilterUpdate, filter, !isSelected,
								tagCategory.category, tag.id)}>
							<b>{tag.name}</b>&nbsp;<span>({tag.count})</span>
						</a>;
					})}
				</div>
			</div>;
		})}
		<div className="addon_tag_filter_column">
			<div className="addon_tag_filter_title">关键字</div>
			<form id="keyword_search" onSubmit={setKeywordFilter.bind(this, onFilterUpdate, filter)}>
				<div className="addon_tag_filter_search">
					<input className={"input "+(filter.keyword?"valid":"")} required={true} type="text" id="txtKeyword"
						defaultValue={filter.keyword}
						placeholder="Search" autoComplete="off" tabIndex={1} />
					<input className="btn" id="btnKeyword" type="submit" value="Submit" tabIndex={3} />
				</div>
			</form>
		</div>
	</div>;
}

/** @param {SteamInventoryFilter} filter */
function toggleTagFilter(callback, filter, enable, category, tagId, /*----*/event) { 
	event.preventDefault();

	let newFilter = Object.assign({}, filter);
	let newFilterTags = newFilter.tags;
	if (enable) { 
		if (!(category in newFilterTags))
			newFilterTags[category] = { [tagId]: true };
		if (!(tagId in newFilterTags[category]))
			newFilterTags[category][tagId] = true;
	} else {
		//disable
		if (category in newFilterTags)
			delete newFilterTags[category][tagId];
		if (Object.keys(newFilterTags[category]).length == 0)
			delete newFilterTags[category];
	}
	console.log(newFilter);
	callback(newFilter);
}

/** @param {SteamInventoryFilter} filter */
function setKeywordFilter(callback, filter, /*----*/event) { 
	event.preventDefault();
	
	let newFilter = Object.assign({}, filter);
	//@ts-ignore
	newFilter.keyword = document.getElementById('txtKeyword').value;
	console.log(newFilter);
	callback(newFilter);
}
//@ts-check
/// <reference path="./api.d.ts" />

import { InventoryFilterByKeyword, InventoryFilterByTags } from "./inventory_filter";

/**
 * @param {SteamInventories} inventories 
 * @param {(index: number, item: SteamInventoryItem, desc: SteamInventoryItemDescription) => boolean} iterator
 * @param {number} [from] 
 * @param {number} [to] 
 */
export function iterateInventory(inventories, iterator, from = -1, to = -1) { 
	if (!inventories) return;
	
	if (from < 0) from = 0;
	if (to < 0) to = inventories.totalCount;

	let { segmentIndex, segmentOffset } = locateInInventories(inventories, from);
	let segment = inventories.segments[segmentIndex];
	
	// invalid index
	if (segmentIndex < 0 || segmentOffset < 0) return;

	for (let i = from; i < to;) { 
		if (!segment) return;

		let items = segment.items, desc = generateDescriptionMap(segment.descriptions);
		for (let offset = segmentOffset; offset < items.length && i < to; i++ , offset++) {
			let item = items[offset];
			if (iterator(i, item, desc[`${item.classid}-${item.instanceid}`]) === false)
				return;	
		}
		segmentOffset = 0;
		segment = inventories.segments[++segmentIndex];
	}
}

/**
 * @param {SteamInventories} inventories 
 * @param {number} index 
 */
function locateInInventories(inventories, index) { 
	let { segments, totalCount } = inventories;
	const invalidResult = { segmentIndex: -1, segmentOffset: -1 };
	if (index < 0 || index > totalCount)
		return invalidResult;
	let segmentIndex = 0;
	for (let i = 0; i < segments.length; i++) {
		let length = segments[i].items.length
		if (index >= length) {
			index -= length;
			segmentIndex++;
			continue;
		}
		return { segmentIndex, segmentOffset: index };
	}
	return invalidResult;
}

/**
 * @param {SteamInventories} inventories 
 * @param {(index: number, item: SteamInventoryItem, desc: SteamInventoryItemDescription) => boolean} filter 
 * @param {number} [from] 
 * @param {number} [to] 
 * @returns {SteamInventories}
 */
export function filterInventory(inventories, filter, from = -1, to = -1) { 
	let items = [], descriptions = [];
	iterateInventory(inventories, (index, item, desc) => {
		if (filter(index, item, desc)) { 
			items.push(item);
			descriptions.push(desc);
		}
		return true;
	}, from, to);
	return { segments: [{ items, descriptions }], totalCount: items.length };
}

/**
 * @param {SteamInventories} inventories 
 * @param {SteamInventoryFilter} rules
 * @param {number} [from] 
 * @param {number} [to] 
 * @returns {SteamInventories}
 */
export function filterInventoryByRules(inventories, rules, from = -1, to = -1) { 
	let tagRules = rules.tags;
	/** @type {((desc: SteamInventoryItemDescription) => boolean)[]} */
	let filters = Object.keys(tagRules).map(category => 
		InventoryFilterByTags.bind(this, category, Object.keys(tagRules[category])))

	if (rules.keyword)
		filters.push(InventoryFilterByKeyword.bind(this, rules.keyword.toLowerCase()));
	
	if (filters.length == 0)
		return inventories;
	
	//Optimize one filter
	if (filters.length == 1) {
		let filter = filters[0];
		return filterInventory(inventories, (index, item, desc) => filter(desc), from, to);
	}

	return filterInventory(inventories, (index, item, desc) => {
		for (let filter of filters)
			if (!filter(desc))
				return false;
		return true;
	}, from, to);
}

/**
 * @param {SteamInventories} inventories 
 * @returns {SteamInventoryTagsManager}
 */
export function getInventoryTagsManager(inventories) { 
	/** @type {SteamInventoryTagsManager} */
	let result = {};
	iterateInventory(inventories, (index, item, desc) => {
		let tags = desc.tags || [];
		for (let tag of tags) {
			if (!tag) continue;

			let { category, internal_name, localized_category_name, localized_tag_name } = tag;
			if (!(category in result)) 
				result[category] = { category, name: localized_category_name, tags: {} };

			let tagsResult = result[category].tags;
			if (!(internal_name in tagsResult))
				tagsResult[internal_name] = { id: internal_name, name: localized_tag_name, count: 0 };

			tagsResult[internal_name].count++;
		}
		return true;
	});
	return result;
}

/**
 * @param {SteamInventoryItemDescription[]} descriptions 
 * @returns {SteamInventoryDescriptionMap}
 */
function generateDescriptionMap(descriptions) { 
	let result = {};
	for (let desc of descriptions)
		result[`${desc.classid}-${desc.instanceid}`] = desc;
	return result;
}

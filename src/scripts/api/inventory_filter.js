/**
 * @param {string} lowerCaseKeyword 
 * @param {SteamInventoryItemDescription} description 
 */
export function InventoryFilterByKeyword(lowerCaseKeyword, description) { 
	let { name, type } = description;
	if (name && name.toLowerCase().indexOf(lowerCaseKeyword) >= 0)
		return true;
	if (type && type.toLowerCase().indexOf(lowerCaseKeyword) >= 0)
		return true;
	return false;
}

/**
 * @param {string} category 
 * @param {string[]} tagIds 
 * @param {SteamInventoryItemDescription} description 
 */
export function InventoryFilterByTags(category, tagIds, description) { 
	let { tags } = description;
	if (!tags || tags.length == 0)
		return false;
	for (let tag of tags) { 
		if (tag.category != category)
			continue;
		return tagIds.indexOf(tag.internal_name) >= 0;
	}
	return false;
}

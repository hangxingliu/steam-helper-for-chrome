//@ts-check
/// <reference path="../../api/api.d.ts" />

import React from 'react';
import { getImageURL, getEmptyImageURL } from '../../api/image';
import { decodeSteamDescription } from '../../api/description';

/** @type {SteamInventoryItem} */
const DEFAULT_ITEM_ARRAY = null;
/** @type {SteamInventoryItemDescription} */
const DEFAULT_DESC_ARRAY = null;
/** @type {SteamInventoryCategory} */
const DEFAULT_CATEGORY = null;

const DEFAULT_PAGE_SWITCHER = (newPage = 1) => void newPage;

export function InventoryRightSide({
	item = DEFAULT_ITEM_ARRAY,
	description = DEFAULT_DESC_ARRAY,
	category = DEFAULT_CATEGORY
}) {
	if (!item || !description)
		return (<div className="inventory_page_right" style={{ minHeight: '620px' }}>
			<div className="inventory_iteminfo" id="iteminfo1" style={{ opacity: 1, zIndex: 1 }}>
			</div>
		</div>);

	let categoryIcon = getEmptyImageURL(), categoryName = '';
	if (category) {
		categoryIcon = category.icon;
		categoryName = category.name;
	}

	let name = description.name;
	if (parseInt(item.amount) > 1) name = `${item.amount} ${name}`;

	let subName = '';
	if (description.market_name != description.name)
		subName = `Market name: ${description.market_name}`;

	let image = getImageURL(description.icon_url_large, 330, 192);

	return <div className="inventory_page_right" >
		<div className="inventory_iteminfo" id="iteminfo1" style={{ opacity: 1, zIndex: 1 }}>
			<div className="item_desc_content" id="iteminfo1_content">
				<div className="item_desc_icon">
					<div className="item_desc_icon_center">
						<img id="iteminfo1_item_icon" src={image} alt={name} />
					</div>
				</div>
				<div className="item_desc_description">
					<h1 className="hover_item_name" id="iteminfo1_item_name">{name}</h1>
					<h2 className="hover_item_sub_name">{subName}</h2>

					<div className="item_desc_game_info" id="iteminfo1_game_info">
						<div className="item_desc_game_icon">
							<img id="iteminfo1_game_icon" src={categoryIcon} alt={categoryName} />
						</div>
						<div id="iteminfo1_game_name" className="ellipsis">{categoryName}</div>
						<div id="iteminfo1_item_type" className="">{description.type}</div>
					</div>

					<div className="item_desc_descriptors">
						{  // 描述
							(description.descriptions || []).map((desc, i) => {
							let styleAttr = desc.color ? {color: `#${desc.color}`} : {};
							return <div key={i} style={styleAttr}
								className="item_desc_descriptors">{decodeSteamDescription(desc.value)}</div>
							})}
					</div>
						
					<div className="item_actions">
						{  // 操作
							(description.actions || []).map((action, i) =>
								<a key={i} target="_blank" className="btn_small btn_grey_white_innerfade"
									href={action.link}><span>{action.name}</span></a>
							)}
					</div>
					
					<div className="item_desc_descriptors">
					{  // 给拥有者的消息, 例如: xxx 天后可以交易
						(description.owner_descriptions || []).map((desc, i) => {
						let styleAttr = desc.color ? {color: `#${desc.color}`} : {};
						return <div key={i} style={styleAttr}
							className="item_desc_descriptors">{decodeSteamDescription(desc.value)}</div>
							})}
					</div>
					
					<div className="item_owner_actions">
						{  // 操作
							(description.owner_actions || []).map((action, i) =>
								<a key={i} target="_blank" className="btn_small btn_grey_white_innerfade"
									href={action.link}><span>{action.name}</span></a>
							)}
					</div>

				</div>
			</div>
			<div className="addon_tags_container">
				{description.tags.map((tag, i) => 
					<div key={i} className="addon_tag_item">
						<a className="type ellipsis" href="#">{tag.localized_category_name}</a>
						<a className="name ellipsis" href="#">{tag.localized_tag_name}</a>
					</div>
				)}
			</div>
		</div>
	</div>;
}
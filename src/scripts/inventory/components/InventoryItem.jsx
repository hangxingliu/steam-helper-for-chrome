//@ts-check

import React from 'react';
import { getImageURL } from '../../api/image';

/** @type {SteamInventoryItem} */
const DEFAULT_ITEM = null;
/** @type {SteamInventoryItemDescription} */
const DEFAULT_DESC = null;
const DEFAULT_ONCLICK = (item, desc) => void desc;



export function InventoryItem({
	item = DEFAULT_ITEM,
	desc = DEFAULT_DESC,
	onClick = DEFAULT_ONCLICK
}) {
	if(!item || !desc)
		return <div className="itemHolder disabled"></div>;
		
	/** @type {React.CSSProperties} */
	let styleAttr = {}, textColorStyle = {};
	if(desc.background_color) styleAttr.backgroundColor = `#${desc.background_color}`;
	if(desc.name_color) {
		let color = `#${desc.name_color}`;
		styleAttr.borderColor = color;
		textColorStyle.color = color;
	}

	let moreThanOne = parseInt(item.amount) > 1;
	let imageIcon = getImageURL(desc.icon_url, 96, moreThanOne ? 58 : 96);
	
	return <div className="itemHolder">
			<div className="item context2" style={styleAttr}>
				<img src={imageIcon} />
				{moreThanOne
					? <div className="item_info amount" style={textColorStyle}>{item.amount}</div> 
					: <div className="item_info"> -- </div>}
				<a href="#" onClick={(event) => {
					event.preventDefault();
					onClick && onClick(item, desc);}
				} className="inventory_item_link"></a>
			</div>
		</div>;
}
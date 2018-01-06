//@ts-check
/// <reference path="./components.d.ts" />

import React from 'react';
import { getImageURL, getEmptyImageURL } from '../../api/image';
import { decodeSteamDescription } from '../../api/description';

/** 
 * @augments {React.Component<InventoryRightSideComponent, {}>} 
 */
export class InventoryRightSide extends React.Component {

	constructor(props) { 
		super(props);
		this.state = {loading: false, loadingTimer: null};
	}

	/** @param {InventoryRightSideComponent} newProps */
	componentWillReceiveProps(newProps) { 
		// console.log(newProps);
		if (newProps.description && this.props.description &&
			newProps.description.icon_url_large != this.props.description.icon_url_large) {
			if (this.state.loadingTimer)
				clearTimeout(this.state.loadingTimer);

			this.setState({
				loading: true, loadingTimer: setTimeout(() => {
					this.setState({ loading: false, loadingTimer: null });
				}, 100)
			});
		}
	}

	render() {
		let { item, description, category } = this.props;
		if (this.state.loading || !item || !description)
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

		let { tradable, marketable, marketPrice } = description;

		let marketLink = `https://steamcommunity.com/market/listings/${description.appid}/${description.market_hash_name}`;

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

						<div className="item_trade_market_info">
							<span style={{ color: tradable ? void 0 : '#f47b20' }}>
								{tradable ? '可交易' : '不可交易'}</span> &nbsp;&nbsp;
						<span style={{ color: marketable ? void 0 : '#f47b20' }}>
								{marketable ? '可出售' : '不可出售'}</span>
						
						</div>

						<div className="item_desc_descriptors">
							{  // 描述
								(description.descriptions || []).map((desc, i) => {
									let styleAttr = desc.color ? { color: `#${desc.color}` } : {};
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
									let styleAttr = desc.color ? { color: `#${desc.color}` } : {};
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
				<div className="item_market_actions" id="iteminfo0_item_market_actions">
					<div>
						<div style={{ height: "24px" }}>
							<a href={marketLink} target="_blank">在社区市场中查看</a>
						</div>
						{description.marketPrice ?
							<div style={{ minHeight: '3em', marginLeft: '1em' }}>
								起价: <b>{description.marketPrice.lowestPrice}</b>
								&nbsp;&nbsp;
							<small>({timestamp2str(description.marketPrice.timestamp)})</small>
								<br />
								个数: 在 24 小时内卖出了 {description.marketPrice.last24hrs} 个<br />
							</div> : ''}
					</div>
					<a className="item_market_action_button item_market_action_button_green" href="javascript:SellCurrentSelection()">
						<span className="item_market_action_button_edge item_market_action_button_left"></span>
						<span className="item_market_action_button_contents">出售</span>
						<span className="item_market_action_button_edge item_market_action_button_right"></span>
					</a>
				</div>
			</div>
		</div>;
	}
}	

function timestamp2str(ts = 0) { 
	return new Date(ts).toLocaleString();
}
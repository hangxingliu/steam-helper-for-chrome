//@ts-check
/// <reference path="./components.d.ts" />

import React from 'react';
import { getImageURL } from '../../api/image';

/** 
 * @augments {React.Component<InventoryItemComponent, {}>} 
 */
export class InventoryItem extends React.Component { 
	constructor(props) { 
		super(props);
		this.state = {loading: false, loadingTimer: null};
	}

	/** @param {InventoryItemComponent} newProps */
	componentWillReceiveProps(newProps) { 
		// console.log(newProps);
		if (newProps.desc && this.props.desc && newProps.desc.icon_url != this.props.desc.icon_url) {
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
		let { item, desc, onClick } = this.props;

		if (this.state.loading || !item || !desc)
			return <div className="itemHolder disabled"></div>;

		/** @type {React.CSSProperties} */
		let styleAttr = {}, textColorStyle = {};
		if (desc.background_color) styleAttr.backgroundColor = `#${desc.background_color}`;
		if (desc.name_color) {
			let color = `#${desc.name_color}`;
			styleAttr.borderColor = color;
			textColorStyle.color = color;
		}

		let moreThanOne = parseInt(item.amount) > 1;
		let imageIcon = getImageURL(desc.icon_url, 96, moreThanOne ? 58 : 96);

		let priceText = '--', last24hrsText = '';
		if (desc.marketPrice) {
			let price = desc.marketPrice;
			priceText = `${price.lowestPrice}`;
			last24hrsText = `(${price.last24hrs>=1000?'999+':price.last24hrs})`;
		}

		return <div className="itemHolder">
			{/* <div className="select-overlay"><input type="checkbox" /></div>	 */}
			{desc.removedReason ? <div className="removed-overlay">{desc.removedReason}</div> : null}
			<div className="item context2" style={styleAttr}>
				<img src={imageIcon} />
				{moreThanOne
					? <div className="item_info amount" style={textColorStyle}>{item.amount}</div>
					: ''}
				<div className="item_info" style={{marginTop: moreThanOne?'17px':void 0}}>
					<span>{priceText}</span> &nbsp;
					<span className="last24hrs">{last24hrsText}</span>
				</div>

				<a href="#" onClick={(event) => {
					event.preventDefault();
					onClick && onClick(item, desc);
				}} className="inventory_item_link"></a>
			</div>
		</div>;
	}
}
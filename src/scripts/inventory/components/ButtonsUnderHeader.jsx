//@ts-check

import React from 'react';

export function ButtonsUnderHeader({ onClickClearCache }) {
	return <div className="inventory_links" style={{maxWidth: '980px', margin: '0 auto 20px auto'}}>
		<div className="inventory_rightnav">
			<a className="btn_darkblue_white_innerfade btn_medium new_trade_offer_btn"
				onClick={() => onClickClearCache && onClickClearCache()}>
				<span>清除缓存</span>
			</a>
		</div>
		<div style={{clear: 'both'}}></div>
	</div>;
}
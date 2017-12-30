//@ts-check

import React from 'react';

export function LoadError({
	reason
}) {
	return <div id="inventory_load_error_ctn">
			<div className="inventory_load_error">
				<div className="inventory_load_error_header">
					<img src="https://steamcommunity-a.akamaihd.net/public/images/economy/market/icon_alertlistings.png" 
						className="load_error_icon" />
					<div className="reason">{reason}</div>
					<div className="btnv6_blue_hoverfade btn_small retry_load_btn"
						onClick={() => location.reload()}>
						<span>刷新页面</span>
					</div>
				</div>
			</div>
		</div>;
}
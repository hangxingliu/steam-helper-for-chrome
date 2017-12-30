//@ts-check
/// <reference path="../../api/api.d.ts" />

import React from 'react';

/**
 * @param {{category: SteamInventoryCategory[]}} props
 */
export function CategoryTabs(props) {
	let category = props.category || [];
	return <div className="games_list_tabs_ctn">
			<div className="games_list_tabs">
				{category.map((c, index) => {
					let { appid, name, count, icon } = c;
					return [
						<a key={appid} href={"#"+appid} className={"games_list_tab "+(index==0?"first_tab":"")}>
							<span className="games_list_tab_icon item_desc_game_icon">
								<img src={icon} />&nbsp;
							</span>
							<span className="games_list_tab_name">{name}</span>
							<span className="games_list_tab_number"> ({count}) </span>
						</a>,
						<div key={appid+"_separator"} 
							className={index % 4 == 3 ? "games_list_tab_row_separator" : "games_list_tab_separator"}>
						</div>
					]
				})}
				<div style={{clear: "both", height: "0px"}}></div>
			</div>
		</div>;

}
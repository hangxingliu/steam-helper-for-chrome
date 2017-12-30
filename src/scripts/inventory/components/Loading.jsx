//@ts-check

import React from 'react';

export function Loading({
	message = ''
}) {
	return <div className="filter_tag_options filter_expanded" >
			<div className="app_tags_container">
				<div className="inventory_loading_indicator" style={{opacity: 1}}>
					<img src="./images/loading.gif" />
					{message 
						? <div className="text">{message}</div>
						: ''}
				</div>
			</div>
		</div>;
}
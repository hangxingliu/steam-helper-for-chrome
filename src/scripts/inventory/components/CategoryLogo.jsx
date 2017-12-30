//@ts-check

import React from 'react';

export function CategoryLogo({logo}) {
	return <div className="view_inventory_logo" id="inventory_logos">
		<img id="inventory_applogo" src={logo} />
	</div>;
}
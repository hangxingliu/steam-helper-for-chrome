//@ts-check

let React = require('react');

module.exports = Header;

function Header({ gotoSettings, gotoIndex, page }) {
	return (
		<div className="header">
			<span className="page-title">
				Steam Helper
			</span>	
			<a className="btn-settings" onClick={page=='settings'?gotoIndex:gotoSettings}>
				{
					page == 'settings'
					? (<i className="ion-home"></i>)	
					: (<i className="ion-gear-b"></i>)
				}
			</a>
		</div>
	);
}
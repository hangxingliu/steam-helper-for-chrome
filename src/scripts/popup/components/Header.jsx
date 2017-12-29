import React from 'react';

const EMPTY_CALLBACK = (...p) => void p; 

export function Header({ 
	onClickSettings = EMPTY_CALLBACK,
	onClickBack = EMPTY_CALLBACK, 
	inSettingPage = false 
}) {
	return (
		<div className="header">
			<span className="page-title">
				Steam Helper
			</span>	
			<a className="btn-settings" onClick={inSettingPage ? onClickBack : onClickSettings}>
				{inSettingPage
					? (<i className="ion-home"></i>)	
					: (<i className="ion-gear-b"></i>)}
			</a>
		</div>
	);
}
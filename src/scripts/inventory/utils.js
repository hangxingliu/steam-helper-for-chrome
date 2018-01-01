//@ts-check

import React from 'react';
import ReactDOM from 'react-dom';

export function renderReactComponent(reactComponent) { 
	let reactRoot = document.getElementById('root');
	return new Promise((resolve, reject) => {
		try { ReactDOM.render(reactComponent, reactRoot, resolve); }
		catch (ex) { return reject(ex); }
	});
}

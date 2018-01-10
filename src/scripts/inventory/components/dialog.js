//@ts-check

import ReactDOM from 'react-dom';

export function getDialogContainer() {
	return document.getElementById('dialogContainer');
}

export function hideDialog() { 
	getDialogContainer().className = '';
}

export function getDialogCancelBtn(text = "取消") { 
	return { text, className: 'btn_grey_white_innerfade', onClick: hideDialog };
}
export function getDialogOKButton(onClick, text = "确定") { 
	return {text, className: 'btn_green_white_innerfade', onClick}
}

export function showDialog(reactComponent) { 
	let container = getDialogContainer();
	return new Promise((resolve, reject) => {
		try {
			ReactDOM.render(reactComponent, container, () => {
				container.className = 'show';
				return resolve();
			});
		} catch (ex) {
			reject(ex);
		}
	});
}
//@ts-check

import React from 'react';
import { getDialogCancelBtn } from './dialog';
import { Dialog } from './Dialog';

const DEFAULT_BUTTON = [getDialogCancelBtn()];

export function LoadingDialog({
	title, message
}) {
	return <Dialog title={title} body={
		<div style={{ textAlign: "center" }}>
			<img src="./images/loading.gif" /><br />
			<div style={{marginTop: "10px"}}>{message}</div>
		</div>
	} buttons={DEFAULT_BUTTON}/>;
}
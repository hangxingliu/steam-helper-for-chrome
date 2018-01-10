//@ts-check

import React from 'react';
import { getDialogCancelBtn } from './dialog';
import { Dialog } from './Dialog';

const DEFAULT_BUTTON = [getDialogCancelBtn("确定")];

export function ErrorDialog({
	title, description, code
}) {
	return <Dialog title={title}
		body={<div className="inventory_load_error" style={{margin: "0"}}>
			<div className="inventory_load_error_header">
				<img src="images/warning.png" className="load_error_icon" />
				<span>{description}</span>
			</div>
			{code ? <div className="code" style={{
				border: "1px solid #4B5058",
				margin: "10px 0 0 8px",
				overflow: "auto"
			}}>
				<pre style={{ paddingLeft: "2em" }}>
					<code>{code}</code>
				</pre>
			</div>: null}
		</div>}
		buttons={DEFAULT_BUTTON} />;
}
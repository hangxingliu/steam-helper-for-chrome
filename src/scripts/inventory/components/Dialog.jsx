//@ts-check

import React from 'react';
import { hideDialog, getDialogCancelBtn } from './dialog';

const DEFAULT_BUTTON = [getDialogCancelBtn()];

export function Dialog({
	title,
	body,
	buttons = DEFAULT_BUTTON,
	width = "500px"
}) {
	return <div className="background">
		<div className="foreground" style={{ width }}>
			<div className="newmodal_header_border">
				<div className="newmodal_header">
					<div className="newmodal_close" onClick={hideDialog}></div>
					<div className="ellipsis">{title}</div>
				</div>
			</div>
			<div className="newmodal_content_border">
				<div className="newmodal_content">
					<div>{body}</div>
					<div className="newmodal_buttons">
						{buttons.map((b, i) =>
							<div key={i} className={b.className + " btn_medium"} onClick={b.onClick}>
								<span>{b.text}</span>
							</div>)}
					</div>
				</div>
			</div>
		</div>
	</div>;
}
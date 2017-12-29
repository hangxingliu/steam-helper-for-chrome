//@ts-check

import React from 'react';

const NON_NOTIFICATION = {enable: false, text: '', style: ''};

export function NotificationBox({ 
	notification = NON_NOTIFICATION
}) {
	let { enable, text, style } = notification;
	return (
		<div className="notification-box">
			{!enable ? '' :
				(<div className={'notification ' + style}>
					{text}
				</div>)
			}		
		</div>
	);
}
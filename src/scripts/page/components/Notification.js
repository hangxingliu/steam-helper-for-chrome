//@ts-check

let React = require('react');

module.exports = NotificationBox;

function NotificationBox({ notification }) {
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
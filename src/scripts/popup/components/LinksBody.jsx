
import React from 'react';

const EMPTY_LINKS = [{
	side: 'left',
	title: '',
	url: ''
}].pop();

export function LinksBody({
	links = EMPTY_LINKS
}) {
	return <div className="body">
		<div className="link-list-wrapper">
			{['left', 'right'].map((side, index) => (
				<ul className={"link-list " + side} key={index}>
					{links.map((link, index) => link.side == side ? (
						<li key={index} className="link-item">
							<a href={link.url} target="_blank">
								{link.title}
							</a>
						</li>
					) : '')}
				</ul>
			))}
		</div>
	</div>;
}
//@ts-check

let React = require('react');

module.exports = IndexPage;

function IndexPage({ links = [] }) {
	return (
		<div className="body">
			<div className="link-list-wrapper">
				{['left', 'right'].map((side, index) => (
					<ul className={"link-list " + side} key={index}>
						{links.map((link, index) => link.side == side ? (
							<li key={index} className="link-item">
								<a href={link.url} target="_blank">
									{link.title}
								</a>
							</li>
						) : '' )}
					</ul>
				))}
			</div>	
		</div>
	);
}
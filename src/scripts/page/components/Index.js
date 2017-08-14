//@ts-check

let React = require('react');

module.exports = IndexPage;

function IndexPage({ links = [] }) {
	return (
		<div className="body">
			<ul className="link-list">
				{
					links.map((link, index) => (
						<li key={index} className="link-item">
							<a href={link.url} target="_blank">
								{link.title}
							</a>
						</li>
					))
				}
			</ul>
		</div>
	);
}
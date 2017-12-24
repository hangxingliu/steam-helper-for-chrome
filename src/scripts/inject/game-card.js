//inject-info-start
//
//	matches:
//  	- "*://steamcommunity.com/*/gamecards/*"
//	run_at: "document_end"
//	all_frames: false
//
//inject-info-end

let { log, error } = require('./utils/logger').init('game-card.js'),
	{ $ } = require('./utils/dom'),
	SteamGameCard = require('./utils/steam_gamecards');

main();
function main() {
	let info = SteamGameCard.getGameCardInfoFromURL(location.href);
	if (!info)
		return showError(`could not get game card info from URL`);
	fetch(1);
	
	function fetch(page) {
		SteamGameCard.getGameCardMarketInfoHTML(info.id, info.border, page,
			SteamGameCard.getOwnedCardsInfoInCurrentPage())
			.then(({ html, next }) => {
				log(`fetch market result page ${page} done! (next: ${next})`);
				showHTML(html);

				if(next) process.nextTick(fetch, page + 1);
			})
			.catch(showError);
	}
}
function showError(error) { 
	showHTML(`<pre style="margin-left: 20px"><code>
			Error: ${error}
		</code></pre>`);
}
function showHTML(html = '') { 
	const SIGN = 'chrome_extension_market_items';
	
	let container = $('.maincontent').expect(1).get();
	let firstChild = container.firstChild;
	let firstChildClass = container.firstChild.className || '';

	if (firstChildClass.indexOf(SIGN) >= 0) {
		firstChild.innerHTML += html;
	} else {
		let div = document.createElement('div');
		div.className = `${SIGN} badge_row depressed`;
		div.innerHTML = html;

		container.insertBefore(div, firstChild);
	}
}

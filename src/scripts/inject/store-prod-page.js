//inject-info-start
//
//	matches:
//  	- "*://store.steampowered.com/app/*"
//	run_at: "document_end"
//	all_frames: false
//
//inject-info-end

let { log, error } = require('./utils/logger').init('store-prod-page.js'),
	{ $, prependDivInElement } = require('./utils/dom'),
	{ getDateString } = require('./utils/datetime'),
	Steam = require('./utils/steam');

const COUNTRY = 'cn';

//https://steamdb.info/api/GetPriceHistory/?appid=301860&cc=cn
global.app = new App();
function App() {
	let container = $('#game_area_purchase').expect(1).get();

	let appId = Steam.getAppIdFromURL(location.href),
		steamDBLink = Steam.getSteamDBLink(appId);

	prependDivInElement(container, `	
		<div class="game_area_purchase_game_wrapper">
			<div class="game_area_purchase_game">
				<h1>价格信息</h1>
				<div id="steamDBPriceInfo"></div>
				<div class="game_purchase_action">
					<div class="game_purchase_action_bg">
					<div class="btn_addtocart">
						<a class="btnv6_blue_blue_innerfade btn_medium" 
							target="_blank"
							href="${steamDBLink}">
							<span>Goto SteamDB</span>
						</a>
					</div>
				</div>
			</div>
		</div>`
	);
	
	Steam.getPriceHistory(appId, COUNTRY).then(prices => {
		let ctx = getPriceDisplayContainer();
		ctx.style.color = 'green';
		ctx.style.fontSize = '1.6em';
		ctx.style.marginTop = '1em';
		ctx.innerHTML = getPriceInfo(prices);
	}).catch(ex => { 
		let ctx = getPriceDisplayContainer();
		ctx.style.color = 'red';
		ctx.style.fontSize = '1.4em';

		let bd = ex;
		if (typeof ex != 'string' && ex)
			bd = `${ex.message}\n${ex.stack}`;
		ctx.innerHTML = `无法获取价格信息!<br/><pre><code>${bd}</code></pre>`;
	});
}

/** @param {PriceHistoryArray} prices */
function getPriceInfo(prices) { 
	if (prices.length == 0)
		return '<div style="color: grey;">无价格信息</div>';	
	if (prices.length == 1) { 
		//#1D7FAB: steam blue
		return `<div style="color: #1D7FAB">
			此游戏目前只有一个价格: <b>${prices[0].price}</b><br/>
			<small>发售日期: <b>${getDateString(prices[0].from)}</b></small>
		</div>`;
	}	
	let first = prices[0];
	
	let historyLowestArray = prices.slice(0, -1)
		.filter(it => it.price > 0).sort((a, b) => a.price - b.price);
	let lowestPrice = historyLowestArray[0].price;
	let historyLowest = historyLowestArray.filter(i => i.price == lowestPrice)
		.sort((a, b) => b.from - a.from)[0];
	
	let current = prices.slice(-1)[0];
	
	let description = '<div style="color: red">不是最低价, 买前三思</div>';
	if (first.price == current.price)
		description = `<div style="color: red; font-weight: bolder; font-size: 1.2em">
			原价警告!! </div >`;
		else if (historyLowest.price == current.price)
			description = `<div style="color: limegreen">最低价</div>`;
		else if (historyLowest.price > current.price)
			description = `<div style="color: green; font-weight: bolder; font-size: 1.4em">再创低价!! 好玩就入手了吧!</div>`;
	
	let lowestRange = '';
	let freeRange = [];
	let t = historyLowest.from.getTime();
	for (let i = 0; i < prices.length; i++) { 
		let p = prices[i];
		if (p.price == 0) {
			let a = getDateString(p.from);
			let b = prices[i + 1] ? getDateString(prices[i + 1].from) : '';
			freeRange.push(`(${a}~${b})`);
		} else if (p.from.getTime() == t) { 
			lowestRange = `${getDateString(p.from)}~`;
			if (prices[i + 1])
				lowestRange += `${getDateString(prices[i + 1].from)}`;	
		}
	}

	let freeRangeString = '';
	if (freeRange.length > 2)
		freeRangeString = '... ' + freeRange.slice(-2).join(' ');
	else if (freeRange.length > 0)
		freeRangeString = freeRange.join(' ');
	
	if(freeRangeString)
		freeRangeString = `<small style="color: grey">曾经免费: ${freeRangeString}</small><br/>`;

	return `<div style="color: white">
		<small style="color: grey">
			发售日期: ${getDateString(first.from)}</small><br/>
		${freeRangeString}
		历史低价: <b style="color: white">${historyLowest.price}</b> (${lowestRange})<br/>
		目前价格: <b style="color: white">${current.price}</b><br/>
		${description}
	</div>`;
}

/** @returns {HTMLElement} */
function getPriceDisplayContainer() { return $('#steamDBPriceInfo').expect(1).get(); }
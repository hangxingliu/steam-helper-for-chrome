//@ts-check
/// <reference path="./utils.d.ts" />

function getGameCardInfoFromURL(url = "") { 
	let matched = url.match(/gamecards\/(\d+)/);
	if (!matched)
		return null;
	return {
		id: matched[1],
		border: url.indexOf('border=1') > 0 ? 1 : 0
	};
}

function getGameCardMarketInfoHTML(id = '', border = 0, page = 1, _owned = []) { 
	let owned = _owned.map(it => ({ name: normalizeName(it.name), count: it.count }));
	return new Promise((resolve, reject) => {
		let url = `https://steamcommunity.com/market/search/render/?query=&start=${(page-1)*10}` +
			`&count=10&search_descriptions=0&sort_column=price&sort_dir=desc` +
			`&appid=753&category_753_Game%5B%5D=tag_app_${id}` +
			`&category_753_cardborder%5B%5D=tag_cardborder_${border}`;

		let xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = () => {
			if (xhr.readyState != 4 || xhr.status != 200)
				return reject(`xhr.readyState = ${xhr.readyState}; ` +
					`xhr.status = ${xhr.status};`);
			
			// pagesize
			// results_html
			// start
			// success
			// total_count
			let r = JSON.parse(xhr.responseText);
			let doc = document.createElement('div');
			doc.innerHTML = r.results_html;
			
			let html = `<table style="width:100%;">`;
			/** @type {NodeListOf<HTMLLinkElement>} */
			let results = doc.querySelectorAll('.market_listing_row_link');
			for (let dom of results) {
				/** @type {HTMLElement} */
				let thumb = dom.querySelector('.market_listing_item_img');
				thumb.style.maxWidth = '62px';
				
				let link = document.createElement('a');
				link.href = dom.href;
				link.target = '_blank';
				link.className = 'btn_grey_grey btn_medium';
				link.innerHTML = '<span>Goto Market</span>';
				
				let name = dom.querySelector('.market_listing_item_name').innerHTML;
				let count = dom.querySelector('.market_listing_num_listings_qty').innerHTML;
				let price = dom.querySelector('.market_table_value .normal_price').innerHTML;

				let owned = getOwnedCount(name);
				let color = owned > 0 ? 'white' : '#666';

				html += `<tr>
					<td style="width:62px">${thumb.outerHTML}</td>
					<td style="color:${color};font-size:1.2em;">
						(${owned}) ${name}
					</td>
					<td style="width:128px">count: ${count}</td>
					<td style="color:${color};width: 128px">price: ${price}</td>
					<td style="width: 128px">${link.outerHTML}</td>
				</tr>`;
			}
			html += `</table>`;
			return resolve({ html, next: r.total_count > r.pagesize});
		}
		xhr.onerror = (err) => reject(err);
		xhr.send();
	});
	/** @returns {number} */
	function getOwnedCount(name) { 
		name = normalizeName(name);
		for (let it of owned) { 
			let itName = it.name;
			if (itName == name)
				return it.count;
		}
		return 0;
	}
}

function getOwnedCardsInfoInCurrentPage() { 
	let result = [{ name: '', count: 0 }]; result.pop();
	let doms = document.querySelectorAll('.badge_card_set_card.owned');
	for (let dom of doms) { 
		let domText = dom.querySelector('.badge_card_set_text');
		let countText = domText.querySelector('.badge_card_set_text_qty');
		/** @type {string} */
		//@ts-ignore
		let text = domText.innerText, countStr = countText.innerText.trim();
		let name = text.trim().replace(countStr, '').trim();
		let count = parseInt((countStr.match(/\d+/))[0]);
		result.push({ name, count });
	}
	return result;
}

function normalizeName(name = '') { return name.replace(/\W/g, '').toLowerCase(); }

module.exports = {
	getGameCardInfoFromURL,
	getGameCardMarketInfoHTML,
	getOwnedCardsInfoInCurrentPage
};
export function getImageURL(imageName = '', x = 96, y = 96, bEnableHighDPI = true) { 
	// https://steamcommunity-a.akamaihd.net/public/javascript/economy_v2.js?v=m7rpyWoQwPSY&l=schinese
	
	if ( imageName ) {
		x = x ? x : 0;
		y = y ? y : 0;
		var strSize = '';
		if ( x != 0 || y != 0 ) {
			strSize = '/' + x + 'fx' + y + 'f';

			// we support 2x (but not arbitrary DPIs for caching purposes).
			// The backend does not accept fractional DPIs, they are ignored.
			// 	The elements have to be set up to allow high DPI images - ie, they must be enforcing a css
			//	width or the image will be displayed too large
			if ( bEnableHighDPI && window.devicePixelRatio >= 2 )
				strSize += 'dpx2x';
		}
		return 'https://steamcommunity-a.akamaihd.net/economy/image/' + imageName.trim() + strSize;
	}
	return getEmptyImageURL();
}

export function getEmptyImageURL() { 
	return 'https://steamcommunity-a.akamaihd.net/public/images/trans.gif';
}
export function decodeSteamDescription(str = '') { 
	return str.replace(/\[date\](\d+)\[\/date\]/, (_, num) =>
		new Date(parseInt(num) * 1000).toLocaleString() + ' ');
}
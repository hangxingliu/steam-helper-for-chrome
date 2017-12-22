module.exports = { getDateString };

/** @param {Date} date */
function getDateString(date) {
	return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`;
}

function to2(i) { return i >= 10 ? `${i}` : `0${i}`; }
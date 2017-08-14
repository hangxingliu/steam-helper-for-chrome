//@ts-check

let React = require('react');

module.exports = SettingsPage;

function SettingsPage({ username, notify, updateUsername, gotoIndex, updateIndex }) {
	return (
		<div className="body">
			<div className="input-tip">
				请输入的Steam用户名:
			</div>
			<div className="input-wrapper">
				<input id="inputUsername" type="text"
					className="input"
					autoComplete="off"
					defaultValue={username}
					onKeyDown={(ev) => (ev.which || ev.keyCode) == 13 && saveUsername()}/>
				<a className="input-addon-btn" onClick={saveUsername}>
					<i className="ion-checkmark"></i>
				</a>
			</div>	
		</div>
	);
	
	function saveUsername() {
		//@ts-ignore
		let username = document.getElementById('inputUsername').value.trim();
		if (!username) return notify('请输入你的用户名!', 'warn');
		updateUsername(username);
		notify('用户名保存成功!', 'success');
		setTimeout(() => notify(), 3000);
		updateIndex();
		gotoIndex();
	}
}

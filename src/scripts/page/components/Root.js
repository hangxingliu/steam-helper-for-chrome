//@ts-check

let React = require('react'),
	ReactRedux = require('react-redux');

let Action = require('../action')

let ComponentHeader = require('./Header'),
	ComponentNotification = require('./Notification'),
	ComponentSettings = require('./Settings'),
	ComponentIndex = require('./Index');


const mapStateToProps = (state) => state;

const mapDispatchToProps = {
	gotoSettings: () => Action.switchPage('settings'),
	gotoIndex: () => Action.switchPage('index'),
	updateIndex: () => Action.updateIndexLinks(),
	notify: (msg = '', style = '') =>
		msg ? Action.showNotification(msg, style) : Action.hideNotification(),
	updateUsername: (username) => Action.updateUsername(username)
}

const ContainerRoot = ReactRedux.connect(
	mapStateToProps,
	mapDispatchToProps
)(
	({
		page,
		notify, updateUsername, gotoSettings, gotoIndex, updateIndex,
		username,
		indexLinks,
		notification
	}) => {	
		let ComponentBody = () => {
			if (!username || page == 'settings') {
				return (
					<ComponentSettings
						notify={notify}
						updateUsername={updateUsername}
						gotoIndex={gotoIndex}
						updateIndex={updateIndex}
						username={username} >
					</ComponentSettings>);
			}
			return (
				<ComponentIndex links={indexLinks}>
				</ComponentIndex>);
		}

		return (<div>
			<ComponentHeader gotoSettings={gotoSettings} gotoIndex={gotoIndex} page={page}/>
			<ComponentNotification notification={notification} />
			<ComponentBody />
		</div>)
	}
);

module.exports = ContainerRoot;

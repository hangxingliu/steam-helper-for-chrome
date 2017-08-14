//@ts-check

//eslint-disable-next-line no-unused-vars
let React = require('react'),
	ReactDOM = require('react-dom'),
	ReactRedux = require('react-redux'), 
	Root = require('./components/Root'),
	Store = require('./store');

let store = Store.create(require('./reducer'));

ReactDOM.render(
	<ReactRedux.Provider store={store}>
		<Root />
	</ReactRedux.Provider>,
	document.getElementById('root')
);

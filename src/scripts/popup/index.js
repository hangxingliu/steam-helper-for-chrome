
import React from 'react';
import ReactDOM from 'react-dom';

import { Header } from './components/Header';
import { LinksBody } from './components/LinksBody';

import { links } from './links';

ReactDOM.render(
	<div>
		<Header></Header>
		<LinksBody links={links}></LinksBody>
	</div>,
	document.getElementById('root')
)
//@ts-check

import React from 'react';
import { getDialogCancelBtn, } from './dialog';
import { Dialog } from './Dialog';

const buttons = [
	getDialogCancelBtn('确定')
];

export function SettingsSavedDialog({ latestSettings = [] }) {
	return <Dialog title="设置已保存" body={
		<div>
			<div>最新的设置</div>
			<div style={{ paddingLeft: '1em', marginTop: '1em' }}>	
				{latestSettings.map(it => 
					<div key={it.key}>
						<div style={{minWidth: '120px', display: 'inline-block'}}>{it.key}:</div>
						<b>{it.value}</b></div>
				)}	
			</div>
		</div>
	} buttons={buttons} />;
}
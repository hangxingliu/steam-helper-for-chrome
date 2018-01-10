//@ts-check

import React from 'react';
import { getDialogCancelBtn, getDialogOKButton, showDialog } from './dialog';
import { Dialog } from './Dialog';
import { ajaxJSON } from '../../api/ajax_utils';
import { setConfigMap, getAllConfig } from '../../api/database/config';
import { ErrorDialog } from './ErrorDialog';
import { SettingsSavedDialog } from './SettingsSavedDialog';

const buttons = [
	getDialogOKButton(onClickSaveSettings, '保存'),
	getDialogCancelBtn('取消')
];

function onClickSaveSettings() {
	let settings = encodeSettings();

	setConfigMap(settings)
		.then(settings => showDialog(
			<SettingsSavedDialog latestSettings={settings} />))
		.catch(err => showDialog(
			<ErrorDialog title="保存出错!" description={err.message || err} code={err.stack} />));
}

function onClickTestPriceAPI() { 
	let _normalize = (uri = '') => uri.trim().replace(/^\//, '').replace(/\/$/, ''),
		_concat = (a = '', b = '') => `${_normalize(a)}/${_normalize(b)}`;
	
	let settings = encodeSettings();
	ajaxJSON('GET', _concat(settings.PriceAPIURL, `summary?${settings.PriceAPIParams}`))
		.then(object => showResult(JSON.stringify(object)))
		.catch(ex => showResult(ex.message || '未知错误,详细请见开发人员控制台'));
	
	function showResult(r) {
		//@ts-ignore
		document.querySelector('#settingPriceAPIResponse').value = r;
	}
}


function encodeSettings() { 
	/** @type {(name: string) => string} */
	//@ts-ignore
	let getValue = name => (document.querySelector(`#setting${name}`) || {value: ''}).value;
	return {
		PriceAPIURL: getValue('PriceAPIURL'),
		PriceAPIParams: getValue('PriceAPIParams')
	};
}

export function showSettingDialog() { 
	return getAllConfig()
		.then(s => {
			console.log('Latest settings:', s);
			showDialog(<SettingsDialog settingsArray={s} />)
		});
}

export function SettingsDialog({ settingsArray }) {
	let settings = {}; settingsArray.forEach(s => settings[s.key] = s.value);
	return <Dialog title="设置" body={
		<div id="settingForm">
			<div className="formGroupTitle">
				附加的价格查询API:
				<a href="https://github.com/hangxingliu/steam-inventory-price-provider"
					target="_blank" style={{color: '#66C0F4', marginLeft: '10px'}}>
					(Project: <b>steam-inventory-price-provider</b>)
				</a>
			</div>
			<div className="formRow small">
				<div className="formRowTitle">查询URL</div>
				<div className="formRowFields">
					<div className="gray_bevel for_text_input">
						<input className="dynInput" type="url" id="settingPriceAPIURL"
							defaultValue={settings.PriceAPIURL}/>
					</div>
				</div>
			</div>
			<div className="formRow small">
				<div className="formRowTitle">附加参数</div>
				<div className="formRowFields">
					<div className="gray_bevel for_text_input">
						<input className="dynInput" type="text" id="settingPriceAPIParams"
							defaultValue={settings.PriceAPIParams}/>
					</div>
				</div>
			</div>
			<div className="formRow small">
				<div className="formRowTitle">
					<a className="btn_darkblue_white_innerfade btn_small new_trade_offer_btn"
						onClick={onClickTestPriceAPI}>
						<span>测试</span>
					</a>	
				</div>
				<div className="formRowFields">
					<div className="gray_bevel for_text_input">
						<input className="dynInput" type="text" id="settingPriceAPIResponse" disabled={true}
							placeholder="测试结果" />
					</div>
				</div>
			</div>
		</div>
	} buttons={buttons} />;
}
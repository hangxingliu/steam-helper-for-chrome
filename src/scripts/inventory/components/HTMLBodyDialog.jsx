//@ts-check

import React from 'react';
import { getDialogCancelBtn } from './dialog';
import { Dialog } from './Dialog';

const DEFAULT_BUTTON = [getDialogCancelBtn("确定")];

export function HTMLBodyDialog({
	title, htmlBody, buttons = DEFAULT_BUTTON
}) {
	return <Dialog title={title} body={<div dangerouslySetInnerHTML={{ __html: htmlBody }} ></div>}
		buttons={buttons} />;
}
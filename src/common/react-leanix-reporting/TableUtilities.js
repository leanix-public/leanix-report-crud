/* The MIT License (MIT)

Copyright (c) 2018 LeanIX GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

// from https://github.com/leanix/leanix-custom-reports

import React from 'react';
import Utilities from './../leanix-reporting-utilities/Utilities';
import Link from './Link';
import LinkList from './LinkList';

/* formatting functions for the table */

const OVERFLOW_CELL_STYLE = {
	maxHeight: '150px',
	overflow: 'auto'
};

const DEFAULT_DATE_FORMATTER = new Intl.DateTimeFormat(window.navigator.language, {
	year: 'numeric', month: '2-digit', day: '2-digit'
});

function formatLinkFactsheet(setup) {
	const baseUrl = Utilities.getFrom(setup, 'settings.baseUrl');
	return (cell, row, extraData) => {
		if (!cell || !baseUrl) {
			return '';
		}
		const type = extraData.type ? extraData.type : row[extraData.typeProp];
		return (
			<Link
				link={baseUrl + '/factsheet/' + type + '/' + row[extraData.id]}
				target='_blank'
				text={cell} />
		);
	};
}

function formatLinkArrayFactsheets(setup) {
	const baseUrl = Utilities.getFrom(setup, 'settings.baseUrl');
	return (cell, row, extraData) => {
		if (!cell || !baseUrl) {
			return '';
		}
		const type = extraData.type ? extraData.type : row[extraData.typeProp];
		return (
			<div style={OVERFLOW_CELL_STYLE}>
				<LinkList links={
					cell.reduce((acc, e, i) => {
						acc.push({
							link: baseUrl + '/factsheet/' + type + '/' + row[extraData.id][i],
							target: '_blank',
							text: e
						});
						return acc;
				}, [])}
				delimiter={extraData.delimiter} />
			</div>
		);
	};
}

function formatEnum(cell, row, enums) {
	if (!cell && cell !== 0) {
		return '';
	}
	return enums[cell] ? enums[cell] : '';
}

function formatEnumArray(cell, row, extraData) {
	let result = '';
	if (!cell || !extraData || !extraData.delimiter || !extraData.enums) {
		return result;
	}
	let first = false;
	cell.forEach((e) => {
		const formatted = formatEnum(e, row, extraData.enums);
		if (formatted === '') {
			return;
		}
		if (first) {
			result += extraData.delimiter;
		} else {
			first = true;
		}
		result += formatted;
	});
	if (extraData.delimiter === '<br/>') {
		return (
			<div style={OVERFLOW_CELL_STYLE}
				dangerouslySetInnerHTML={{ __html: result }} />
		);
	}
	return result;
}

function formatOptionalText(cell, row, formatRaw) {
	if (!cell) {
		return '';
	}
	return formatRaw ? cell : (
		<div style={OVERFLOW_CELL_STYLE}>{cell}</div>
	);
}

function formatDate(formatter) {
	return (cell, row) => {
		if (!cell) {
			return '';
		}
		return (
			<span style={{ paddingRight: '10%' }}>
				{formatter ? formatter(cell) : DEFAULT_DATE_FORMATTER.format(cell)}
			</span>
		);
	};
}

// TODO check excel compability for csv export
/*
function _formatDate(date, delimiter, reverse) {
	if (reverse) {
		return date.getFullYear() + delimiter
			+ _formatDateNumber(date.getMonth() + 1) + delimiter
			+ _formatDateNumber(date.getDate());
	}
	return _formatDateNumber(date.getDate()) + delimiter
		+ _formatDateNumber(date.getMonth() + 1) + delimiter
		+ date.getFullYear();
}

function _formatDateNumber(n) {
	return n < 10 ? '0' + n : n;
}*/

function formatArray(cell, row, delimiter) {
	let result = '';
	if (!cell || !delimiter) {
		return result;
	}
	cell.forEach((e) => {
		if (result.length) {
			result += delimiter;
		}
		result += e;
	});
	if (delimiter === '<br/>') {
		return (
			<div style={OVERFLOW_CELL_STYLE}
				dangerouslySetInnerHTML={{ __html: result }} />
		);
	}
	return result;
}

/* formatting functions for the csv export */

function csvFormatDate(formatter) {
	return (cell, row) => {
		if (!cell) {
			return '';
		}
		return formatter ? formatter(cell) : DEFAULT_DATE_FORMATTER.format(cell);
	};
}

/* pre-defined filter objects */

const textFilter = {
	type: 'TextFilter',
	condition: 'like',
	placeholder: 'Please enter a value'
};

function selectFilter(options) {
	return {
		type: 'SelectFilter',
		condition: 'eq',
		placeholder: 'Please choose',
		options: options
	};
}

const dateFilter = {
	type: 'DateFilter'
};

const numberFilter = {
	type: 'NumberFilter',
	placeholder: 'Please enter a value',
	defaultValue: {
		comparator: '<='
	}
};

/* custom PropTypes */

function options(props, propName, componentName) {
	const options = props[propName];
	if (options !== null && typeof options === 'object' && _checkKeysAndValues(options)) {
		// test passes successfully
		return;
	}
	return new Error(
		'Invalid prop "' + propName + '" supplied to "' + componentName + '". Validation failed.'
	);
}

function _checkKeysAndValues(options) {
	for (let key in options) {
		const value = options[key];
		if (typeof value !== 'string' && !(value instanceof String)) {
			return false;
		}
	}
	return true;
}

function idArray(namesPropName) {
	return (props, propName, componentName) => {
		const ids = props[propName];
		const names = props[namesPropName];
		if (names && ids
			 && Array.isArray(names) && Array.isArray(ids)
			 && names.length === ids.length
			 && _isStringArray(ids)) {
			// test passes successfully
			return;
		}
		return new Error(
			'Invalid prop "' + propName + '" supplied to "' + componentName + '". Validation failed.'
		);
	};
}

function _isStringArray(arr) {
	for (let i = 0; i < arr.length; i++) {
		const e = arr[i];
		if (typeof e !== 'string' && !(e instanceof String)) {
			return false;
		}
	}
	return true;
}

export default {
	OVERFLOW_CELL_STYLE: OVERFLOW_CELL_STYLE,
	formatLinkFactsheet: formatLinkFactsheet,
	formatLinkArrayFactsheets: formatLinkArrayFactsheets,
	formatEnum: formatEnum,
	formatEnumArray: formatEnumArray,
	formatOptionalText: formatOptionalText,
	formatDate: formatDate,
	formatArray: formatArray,
	csvFormatDate: csvFormatDate,
	textFilter: textFilter,
	selectFilter: selectFilter,
	dateFilter: dateFilter,
	numberFilter: numberFilter,
	PropTypes: {
		options: options,
		idArray: idArray
	}
};

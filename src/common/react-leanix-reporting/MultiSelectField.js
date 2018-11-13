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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

class MultiSelectField extends Component {

	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
	}

	_onChange(options) {
		this.props.onChange(!options ? [] : options);
	}

	render() {
		const style = {};
		if (this.props.width) {
			style.width = this.props.width;
		}
		return (
			<div className={ 'form-group' + (this.props.useSmallerFontSize ? ' small' : '') + (this.props.hasError ? ' has-error' : '') } style={style}>
				<label htmlFor={this.props.id} className={'control-label' + (this.props.labelReadOnly ? ' sr-only' : '') }>
					{this.props.label}
				</label>
				<Select multi
					name={'MultiSelectField-' + this.props.id}
					id={this.props.id}
					inputProps={{
						alt: this.props.label,
						title: this.props.label
					}}
					placeholder={this.props.placeholder}
					options={this.props.options}
					matchPos='start'
					matchProp='label'
					ignoreCase={true}
					disabled={this.props.disabled || this.props.options.length < 1}
					value={this.props.values}
					onChange={this._onChange} />
				{this._renderHelpText()}
			</div>
		);
	}

	_renderHelpText() {
		if (!this.props.helpText) {
			return null;
		}
		return (
			<span className='help-block'>{this.props.helpText}</span>
		);
	}
}

MultiSelectField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired
		}).isRequired
	).isRequired,
	onChange: PropTypes.func,
	values: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	useSmallerFontSize: PropTypes.bool,
	labelReadOnly: PropTypes.bool,
	placeholder: PropTypes.string,
	width: PropTypes.string,
	hasError: PropTypes.bool,
	helpText: PropTypes.string,
	disabled: PropTypes.bool
};

export default MultiSelectField;
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

class InputField extends Component {

	constructor(props) {
		super(props);
		this._onChange = this._onChange.bind(this);
	}

	_onChange(event) {
		let value = event.target.value;
		this.props.onChange(value);
	}

	render() {
		const style = {};
		if (this.props.width) {
			style.width = this.props.width;
		}
		return (
			<div className={ 'form-group' + (this.props.useSmallerFontSize ? ' small' : '') + (this.props.hasError ? ' has-error' : '') }>
				<label htmlFor={this.props.id} className={'control-label' + (this.props.labelReadOnly ? ' sr-only' : '') }>
					{this.props.label}
				</label>
				<input type={this.props.type}
					disabled={this.props.disabled}
					alt={this.props.label}
					className={'form-control' + (this.props.useSmallerFontSize ? ' input-sm' : '')}
					style={style}
					id={this.props.id}
					name={'input-' + this.props.type + '-' + this.props.id}
					onChange={this._onChange}
					placeholder={this.props.placeholder ? this.props.placeholder : ''}
					value={this.props.value}
					min={this.props.min ? this.props.min : ''}
					max={this.props.max ? this.props.max : ''}
				/>
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

InputField.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	onChange: PropTypes.func,
	value: PropTypes.string.isRequired,
	useSmallerFontSize: PropTypes.bool,
	placeholder: PropTypes.string,
	labelReadOnly: PropTypes.bool,
	min: PropTypes.string,
	max: PropTypes.string,
	width: PropTypes.string,
	hasError: PropTypes.bool,
	helpText: PropTypes.string,
	disabled: PropTypes.bool
};

export default InputField;
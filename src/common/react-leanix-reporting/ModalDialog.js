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

class ModalDialog extends Component {

	constructor(props) {
		super(props);
		this._handleClickForClose = this._handleClickForClose.bind(this);
	}

	_stopEvent(evt) {
		evt.stopPropagation();
	}

	_handleClickForClose(evt) {
		evt.stopPropagation();
		this.props.onClose();
	}

	render() {
		if (!this.props.show) {
			return null;
		}
		// first div prevents click triggers in the outside area
		// second is for positioning of the content panel
		return (
			<div style={{
				position: 'fixed',
				top: '0',
				left: '0',
				width: '100%',
				height: '100%',
				zIndex: '500'
			}} onClick={this._handleClickForClose}>
				<div style={{
					position: 'fixed',
					top: '2.5em',
					width: '100%',
					zIndex: '1000'
				}} onClick={this._handleClickForClose}>
					<div className='panel panel-default' style={{
						width: this.props.width,
						margin: '0 auto',
						zIndex: '2000'
					}} onClick={this._stopEvent}>
						<div className='panel-heading'>
							<h4 className='panel-title'>
								<button type='button' className='close' style={{ right: '0px' }}
									data-dismiss='alert' aria-label='Close'
									onClick={this.props.onClose}>
									<span aria-hidden='true'>&times;</span>
								</button>
								{this.props.title}
							</h4>
						</div>
						<div className='panel-body'>
							{this.props.content()}
						</div>
						{this._renderFooter()}
					</div>
				</div>
			</div>
		);
	}

	_renderFooter() {
		if (!this.props.onOK) {
			return null;
		}
		return (
			<div className='panel-footer clearfix'>
				<span className='pull-right'>
					<button type='button' className='btn btn-success btn-sm'
						aria-label='Apply'
						onClick={this.props.onOK}>
						Apply
					</button>
				</span>
				<span className='pull-right' style={{ marginRight: '0.4em' }}>
					<button type='button' className='btn btn-default btn-sm'
						aria-label='Cancel'
						onClick={this.props.onClose}>
						Cancel
					</button>
				</span>
			</div>
		);
	}
}

ModalDialog.propTypes = {
	show: PropTypes.bool.isRequired,
	width: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	content: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onOK: PropTypes.func
};

export default ModalDialog;

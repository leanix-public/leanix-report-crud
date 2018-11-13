import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReportState from './common/leanix-reporting-utilities/ReportState';
import ModalDialog from './common/react-leanix-reporting/ModalDialog';
import SelectField from './common/react-leanix-reporting/SelectField';
import Checkbox from './common/react-leanix-reporting/Checkbox';

const DIALOG_WIDTH = '500px';

class ConfigureDialog extends Component {

	constructor(props) {
		super(props);
		// bindings
		this._handleOnClose = this._handleOnClose.bind(this);
		this._handleOnOK = this._handleOnOK.bind(this);
		this._handleShowEmptyRowsCheck = this._handleShowEmptyRowsCheck.bind(this);
		this._handleShowEmptyColumnsCheck = this._handleShowEmptyColumnsCheck.bind(this);
		this._handleShowMissingDataWarningCheck = this._handleShowMissingDataWarningCheck.bind(this);
		this._renderContent = this._renderContent.bind(this);
		
		this.showEmptyColumns = this.props.showEmptyColumns;
		this.showEmptyRows = this.props.showEmptyRows;
		this.showMissingDataWarning = this.props.showMissingDataWarning;
	}

	_handleOnClose() {
		this.props.onClose();
	}

	_handleOnOK() {
		const checkBoxSelect = {showEmptyColumns: this.showEmptyColumns, showEmptyRows: this.showEmptyRows, showMissingDataWarning: this.showMissingDataWarning}
		
		const tmp = checkBoxSelect;
		if (!this.props.onOK(tmp)) {
			// dialog will not be closed, therefore preserve current configStore
		}
	}


	_handleShowEmptyRowsCheck(val) {
		if(this.showEmptyRows !== val){
			return;
		}
		this.showEmptyRows = !val;
		this.forceUpdate();
		
	}

	_handleShowEmptyColumnsCheck(val) {
		if(this.showEmptyColumns !== val){
			return;
		}
		this.showEmptyColumns = !val;
		this.forceUpdate();

	}

	_handleShowMissingDataWarningCheck(val) {
		if (this.showMissingDataWarning === val) {
			return;
		}
		this.showMissingDataWarning = val;
		this.forceUpdate();
	}

	render() {
		if (this.props.show) {

		}
		return (
			<ModalDialog show={this.props.show}
				width={DIALOG_WIDTH}
				title='Configure'
				content={this._renderContent}
				onClose={this._handleOnClose}
				onOK={this._handleOnOK}
			/>
		);
	}

	_renderContent() {
		return (
			<div>
				<Checkbox 
					id='showEmptyRows' 
					label='Hide empty rows'
					useSmallerFontSize
					value={!this.showEmptyRows}
					onChange={this._handleShowEmptyRowsCheck}
				/>
				<Checkbox 
					id='showEmptyColumns' 
					label='Hide empty columns'
					useSmallerFontSize
					value={!this.showEmptyColumns}
					onChange={this._handleShowEmptyColumnsCheck}
				/>
				<Checkbox 
					id='showMissingDataWarning' 
					label='Show missing data warning'
					useSmallerFontSize
					value={this.showMissingDataWarning}
					onChange={this._handleShowMissingDataWarningCheck}
				/>
			</div>
		);
	}
}

ConfigureDialog.propTypes = {
	show: PropTypes.bool.isRequired,
	showEmptyColumns: PropTypes.bool.isRequired,
	showEmptyRows: PropTypes.bool.isRequired,
	showMissingDataWarning: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onOK: PropTypes.func.isRequired
};

export default ConfigureDialog;
import React, { Component } from 'react';
import ReportLoadingState from './common/leanix-reporting-utilities/ReportLoadingState';
import MissingDataAlert from './common/react-leanix-reporting/MissingDataAlert';
import Matrix from './Matrix';
import ConfigureDialog from './ConfigureDialog';

const CREATE = "create";
const READ = "read";
const UPDATE = "update";
const DELETE = "delete";
const NA = "n/a";

class Report extends Component {

	constructor(props) {
		super(props);
		
		this._initReport = this._initReport.bind(this);
		this._createConfig = this._createConfig.bind(this);
		this._createDataQuery = this._createDataQuery.bind(this);
		this._handleData = this._handleData.bind(this);
		this._handleError = this._handleError.bind(this);
		this._createDataMapping = this._createDataMapping.bind(this);
		this._createViewMapping = this._createViewMapping.bind(this);
		this._createMissingData = this._createMissingData.bind(this);
		this._handleOnClose = this._handleOnClose.bind(this);
		this._handleOnOK = this._handleOnOK.bind(this);
		this._handleDismissAlertButton = this._handleDismissAlertButton.bind(this);
		this._updateReport = this._updateReport.bind(this);
		this.setup = null; // set during initReport
		this.applicationData = null; // set during initReport
		this.dataObjectData = null;
		this.reportData = [];
		this.missingDataObjects = [];
		this.selectedViewData = null;
		this.mappedViewFactsheets = null;
		this.reportState = {
			showEmptyRows: false,
			showEmptyColumns: true,
			showMissingDataWarning: true
		}
		
		this.state = {
			dataObjectsLoaded: false,
			applicationsLoaded: false,
			loadingState: ReportLoadingState.INIT,
			matrixData: null,
			missingData: null,
			loaded: false,
			showConfigure: false,
			showEmptyRows: false,
			showEmptyColumns: true,
			showMissingDataWarning: true
		};
		
	}

	componentDidMount() {
		lx.init().then(this._initReport).catch(this._handleError);
	}

	_initReport(setup) {
		this.setup = setup;
		
		if(setup.savedState && setup.savedState.customState){
			const error = this._updateReport(setup.savedState.customState);
			if(error){
				console.error("Update error");
			}
		}
		
		lx.showSpinner('Loading data...');
		lx.executeGraphQL(this._createDataQuery()).then((data) => {
			
			data.DataObjects.edges.forEach((dataObject) =>{
				if(dataObject.node.relDataObjectToApplication.edges.length === 0){
					this.missingDataObjects.push(dataObject);
				}
				
			});
			
			for(let app of data.Apllications.edges){
				this.reportData.push(app.node);
			}

			

			this.setState({
				loaded: true,
			});
			this._handleData();
		}).catch(this._handleError);
		lx.hideSpinner();
		lx.ready(this._createConfig());
	}
	
	_createConfig() {
		return {
			allowEditing: false,
			allowTableView: false,
			facets: [
			{
				key: 'DataObject',
				label: lx.translateFactSheetType('DataObject', 'plural'),
				fixedFactSheetType: 'DataObject',
				attributes: ['id', 'displayName'],
				sorting: [{
						key: 'displayName',
						mode: 'BY_FIELD',
						order: 'asc'
					}
				],
				callback: (dataObjects) => {
					if (this.state.loadingState === ReportLoadingState.SUCCESSFUL) {
						this.setState({
							loadingState: ReportLoadingState.NEW_DATA
						});
					}
					

					this.dataObjectData = this._createDataMapping(dataObjects);
					
					if (this.state.loaded) {
						this._handleData();
					}
					
					
				}
			},
			{
				key: 'Application2',
				label: "Y-Axis: " + lx.translateFactSheetType('Application', 'plural'),
				fixedFactSheetType: 'Application',
				attributes: ['id', 'displayName'],
				sorting: [{
						key: 'displayName',
						mode: 'BY_FIELD',
						order: 'asc'
					}
				],
				callback: (applications) => {
					if (this.state.loadingState === ReportLoadingState.SUCCESSFUL) {
						this.setState({
							loadingState: ReportLoadingState.NEW_DATA
						});
					}
					this.applicationData = applications;
					
					if (this.state.loaded) {
						this._handleData();
					}
					
					
				}
			}],
			reportViewFactSheetType: "DataObject",
			reportViewCallback: (viewData) => {
				if (this.state.loadingState === ReportLoadingState.SUCCESSFUL) {
					this.setState({
						loadingState: ReportLoadingState.NEW_DATA
					});
				}
				this.selectedViewData = viewData;
				this._createViewMapping(viewData);
				if(this.state.loaded){
					this._handleData();
				}
			},
			menuActions: {
				showConfigure: true,
				configureCallback: () => {
					if (this.state.loadingState !== ReportLoadingState.SUCCESSFUL || this.state.showConfigure) {
						return;
					}
					this.setState({
						showConfigure: true
					});
				}
			},
			restoreStateCallback: (state) => {
				const error = this._updateReport(state);
				if(error){
					console.error("Update error");
				}
			}
		};
	}
	
	_createDataQuery(){
		return `{
			Apllications: allFactSheets(factSheetType: Application) {
			  edges {
				node {
				  name: displayName
				  id
				  ... on Application {
					relApplicationToDataObject {
					  edges {
						node {
						  id
						  usage
						  factSheet {
							id
							name: displayName
						  }
						}
					  }
					}
				  }
				}
			  }
			}
			DataObjects: allFactSheets(factSheetType: DataObject) {
			  totalCount
			  edges {
				node {
				  name: displayName
				  id
				  ... on DataObject {
					relDataObjectToApplication {
					  edges {
						node {
						  id
						  usage
						  factSheet {
							id
							name: displayName
						  }
						}
					  }
					}
				  }
				}
			  }
			}
		  }`;
	}

	_handleData() {
		
		let matrixData = [];
		//Filtered Applications
		const applicationData = this.applicationData;
		//Filtered DataObjects array by id.
		const dataObjectData = this.dataObjectData;
		const viewDataObjectData = this.mappedViewFactsheets;
		const reportData = this._createDataMapping(this.reportData);
		const missingData = this._createMissingData(this.dataObjectData, this.missingDataObjects);

		//Creates the x-axis-header row.
		matrixData.push([["Usage", "Applications"], CREATE, READ, UPDATE, DELETE, NA]);
		

		if(applicationData){
			applicationData.forEach((app) => {
				if(reportData[app.id]){
					const application = reportData[app.id];

					//y-axis-header cell
					let col0 = {id: application.id, name: application.name, type: "Application"};
					//"create"-cell
					let col1 = [];
					//"read"-cell
					let col2 = [];
					//"update"-cell
					let col3 = [];
					//"delete"-cell
					let col4 = [];
					//"n/a"-cell
					let col5 = [];
					
					application.relApplicationToDataObject.edges.forEach((rel) => {
						const dataObject = rel.node.factSheet;
						const id = dataObject.id;
						
						if(dataObjectData[id] && viewDataObjectData[id]){
							const name = dataObject.name;
							const colors = {color: viewDataObjectData[id].color, bgColor: viewDataObjectData[id].bgColor};
							
							if(rel.node.usage){
								const usage = rel.node.usage;
								if(usage.includes(CREATE)){
									col1.push({id: id, name: name, colors: colors});
								}
								if(usage.includes(READ)){
									col2.push({id: id, name: name, colors: colors});
								}
								if(usage.includes(UPDATE)){
									col3.push({id: id, name: name, colors: colors});
								}
								if(usage.includes(DELETE)){
									col4.push({id: id, name: name, colors: colors});
								}
							}
							else {
								col5.push({id: id, name: name, colors: colors});
							}
						}
					});
					
					matrixData.push([col0, col1, col2, col3, col4, col5]);
				}
			});
		}
		
		if(this.state.loaded === true){
			this.setState({
				matrixData: matrixData,
				missingData: missingData,
				loadingState: ReportLoadingState.SUCCESSFUL
			});
		}
		
	}
	
	_updateReport(state){
		const oldState = this.reportState;
		const newState = state;
		
		try{
			this.setState({
				showEmptyRows: newState.showEmptyRows,
				showEmptyColumns: newState.showEmptyColumns,
				showMissingDataWarning: newState.showMissingDataWarning
			});
			this.reportState = newState;
		} catch(err){
			this.setState({
				showEmptyRows: oldState.showEmptyRows,
				showEmptyColumns: oldState.showEmptyColumns,
				showMissingDataWarning: oldState.showMissingDataWarning
			});
			this.reportState = oldState;
			return err;
		}
		
	}
	
	//Creates a factsheetarray mapped by the factsheetid.
	_createDataMapping(data){
		
		let resultSet = [];
		
		data.forEach((factsheet) => {
			if(!resultSet[factsheet.id]){
				resultSet[factsheet.id] = factsheet;
				resultSet.length++;
			}
		});
		
		return resultSet;
	}
	
	//Creates the an array with color coding for each factsheet mapped by their id.
	_createViewMapping(viewData){
		let mappedLegendItems= [];
		let mappedFactsheets = [];
		
		for(let legendItem of viewData.legendItems){
			mappedLegendItems[legendItem.id] = legendItem;
		}
		
		for(let mapping of viewData.mapping){
			const legendItem = mappedLegendItems[mapping.legendId];
			mappedFactsheets[mapping.fsId] = {color: legendItem.color, bgColor: legendItem.bgColor, legendItemID: legendItem.id};
			mappedFactsheets.length++;
		}
		
		this.mappedViewFactsheets = mappedFactsheets;
		
	}

	//Create an dataobject array with factsheets whithout relations to applications
	_createMissingData(dataObjectData, missingDataObjects){
		let missingData = [];
		const reason = "No relation to application";

		if(dataObjectData != null && missingDataObjects != null && dataObjectData.length > 0 && missingDataObjects.length > 0){
			missingDataObjects.forEach((dataObject) =>{
				if(dataObjectData[dataObject.node.id]){
					missingData.push({
						id: dataObject.node.id,
						name: dataObject.node.name,
						type: "DataObject",
						reason: reason
					})
				}
			});
		}

		return missingData;

	}
	
	_handleOnClose(){
		this.setState({
			showConfigure: false
		});
	}
	
	_handleOnOK(val){

		this.setState({
			showConfigure: false,
			showEmptyColumns: val.showEmptyColumns,
			showEmptyRows: val.showEmptyRows,
			showMissingDataWarning: val.showMissingDataWarning
		});
		
		//Saves the report state
		this.reportState = val;
		lx.publishState(this.reportState);
	}

	_handleDismissAlertButton() {
		this.setState({showMissingDataWarning: false});
		this.reportState.showMissingDataWarning = false;
		lx.publishState(this.reportState);
		this.forceUpdate();
	}
	
	_handleError(err) {
		console.error(err);
		this.setState({ 
			loadingState: ReportLoadingState.ERROR
		});
	}

	render() {
		switch (this.state.loadingState) {
			case ReportLoadingState.INIT:
				return this._renderInit();
			case ReportLoadingState.NEW_DATA:
				return this._renderLoading();
			case ReportLoadingState.SUCCESSFUL:
				return this._renderSuccessful();
			case ReportLoadingState.ERROR:
				return this._renderError();
			default:
				throw new Error('Unknown loading state: ' + this.state.loadingState);
		}
	}

	_renderInit() {
		return (
			<div>
				{this._renderProcessingStep('Initialise report...')}
				<div id='content' />
			</div>
		);
	}

	_renderProcessingStep(stepInfo) {
		return (<h4 className='text-center' dangerouslySetInnerHTML={{ __html: stepInfo }} />);
	}

	_renderLoading() {
		return (
			<div>

				<div id='content' />
			</div>
		);
	}

	_renderError() {
		return (<div id='content' />);
	}

	_renderSuccessful() {
		let key = 0;
		const factsheetList = this.reportData.map(factsheet => {
			return (
				<p key={key++}>{factsheet.name + " id:" + factsheet.id}</p>
			);
		});
		
		return (
			<div>
			
				<ConfigureDialog
					show={this.state.showConfigure}
					showEmptyColumns={this.state.showEmptyColumns}
					showEmptyRows={this.state.showEmptyRows}
					showMissingDataWarning={this.state.showMissingDataWarning}
					onClose={this._handleOnClose}
					onOK={this._handleOnOK}
				/>
				<MissingDataAlert
					show={this.state.showMissingDataWarning}
					data={this.state.missingData}
					onClose={this._handleDismissAlertButton}
					factsheetType={"DataObject"}
					setup={this.setup} />
				<Matrix setup={this.setup} cellWidth='180px'
						factsheetType={"DataObject"}
						data={this.state.matrixData}
						dataAvailable={true}
						showEmptyRows={this.state.showEmptyRows}
						showEmptyColumns={this.state.showEmptyColumns} />
				
			</div>
		);
	}
}

export default Report;

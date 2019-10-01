/*global fetch*/
/*global URLSearchParams*/
import React from 'react';
import packageJson from '../package.json';
import fetchJsonp from 'fetch-jsonp';
/*eslint-disable no-unused-vars*/ 
import axios, { post } from 'axios';
/*eslint-enable no-unused-vars*/
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
//mapbox imports
import Map from './Map.js';
import MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.js';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import jsonp from 'jsonp-promise';
import classyBrew from 'classybrew';
import { getMaxNumberOfClasses } from './genericFunctions.js';
//material-ui components and icons
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Snackbar from 'material-ui/Snackbar';
import Properties from 'material-ui/svg-icons/alert/error-outline';
import RemoveFromProject from 'material-ui/svg-icons/content/remove';
import AddToMap from 'material-ui/svg-icons/action/visibility';
import RemoveFromMap from 'material-ui/svg-icons/action/visibility-off';
import ZoomIn from 'material-ui/svg-icons/action/zoom-in';
import Preprocess from 'material-ui/svg-icons/action/autorenew';
//project components
import AppBar from './AppBar';
import LoadingDialog from './LoadingDialog';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog.js';
import ResendPasswordDialog from './ResendPasswordDialog.js';
import UserMenu from './UserMenu';
import HelpMenu from './HelpMenu';
import OptionsDialog from './OptionsDialog';
import ProfileDialog from './ProfileDialog';
import UsersDialog from './UsersDialog';
import AboutDialog from './AboutDialog';
import MenuItemWithButton from './MenuItemWithButton';
import InfoPanel from './InfoPanel';
import ResultsPanel from './ResultsPanel';
import FeatureInfoDialog from './FeatureInfoDialog';
import ProjectsDialog from './ProjectsDialog';
import NewProjectDialog from './NewProjectDialog';
import FailedToDeleteDialog from './FailedToDeleteDialog';
import PlanningGridDialog from './PlanningGridDialog';
import PlanningGridsDialog from './PlanningGridsDialog';
import NewPlanningGridDialog from './NewPlanningGridDialog';
import ImportPlanningGridDialog from './ImportPlanningGridDialog';
import FeatureDialog from './FeatureDialog';
import FeaturesDialog from './FeaturesDialog';
import NewFeatureDialog from './NewFeatureDialog';
import ImportFeaturesDialog from './ImportFeaturesDialog';
import CostsDialog from './CostsDialog';
import RunSettingsDialog from './RunSettingsDialog';
import ClassificationDialog from './ClassificationDialog';
import ClumpingDialog from './ClumpingDialog';
import ImportProjectDialog from './ImportProjectDialog';
import RunLogDialog from './RunLogDialog';
import ServerDetailsDialog from './ServerDetailsDialog';
import AlertDialog from './AlertDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import Popup from './Popup';
import PopupFeatureList from './PopupFeatureList';
import PopupPAList from './PopupPAList';
import TargetDialog from './TargetDialog';
import ShareableLinkDialog from './ShareableLinkDialog';

//CONSTANTS
let MARXAN_CLIENT_VERSION = packageJson.version; //TODO UPDATE PACKAGE.JSON WHEN THERE IS A NEW VERSION
let DOCS_ROOT = "https://andrewcottam.github.io/marxan-web/documentation/";
let ERRORS_PAGE = DOCS_ROOT + "docs_errors.html";
let SEND_CREDENTIALS = true; //if true all post requests will send credentials
let TORNADO_PATH = "/marxan-server/";
let TIMEOUT = 0; //disable timeout setting
let MAPBOX_USER = "blishten";
let PLANNING_UNIT_STATUSES = [1, 2, 3];
//layer source names
let PLANNING_UNIT_SOURCE_NAME = "planning_units_source";
let WDPA_SOURCE_NAME = "wdpa_source";
//layer names
let PU_LAYER_NAME = "planning_units_layer"; //layer showing the planning units
let STATUS_LAYER_NAME = "planning_units_status_layer"; //layer showing the status of planning units 
let COSTS_LAYER_NAME = "costs_layer"; //layer showing the cost of planning units
let PUVSPR_LAYER_NAME = "planning_units_puvspr_layer"; //layer showing the planning units for a particular feature
let RESULTS_LAYER_NAME = "results_layer"; //layer for either the sum of solutions or the individual solutions
let WDPA_LAYER_NAME = "wdpa"; //layer showing the protected areas from the WDPA
//layer default styles
let PU_LAYER_OPACITY = 0.4;
let STATUS_LAYER_LINE_WIDTH = 1.5;
let PUVSPR_LAYER_LINE_WIDTH = 1.5;
let PUVSPR_LAYER_OUTLINE_COLOR = 'rgba(255, 0, 0, 1)';
let RESULTS_LAYER_FILL_OPACITY_ACTIVE = 0.9;
let RESULTS_LAYER_FILL_OPACITY_INACTIVE = 0;
let WDPA_FILL_LAYER_OPACITY = 0.2;
let HIDE_PUVSPR_LAYER_TEXT = "Remove planning unit outlines";
let SHOW_PUVSPR_LAYER_TEXT = "Outline planning units where the feature occurs";

//an array of feature property information that is used in the Feature Information dialog box - showForOld sets whether that property is shown for old versions of marxan
let FEATURE_PROPERTIES = [{ name: 'id', key: 'ID',hint: 'The unique identifier for the feature', showForOld: false, showForNew: false},
  { name: 'alias', key: 'Alias',hint: 'A human readable name for the feature', showForOld: false, showForNew: false},
  { name: 'feature_class_name', key: 'Feature class name',hint: 'The internal name for the feature in the PostGIS database', showForOld: false, showForNew: false},
  { name: 'description', key: 'Description',hint: 'Full description of the feature', showForOld: false, showForNew: false},
  { name: 'creation_date', key: 'Creation date',hint: 'The date the feature was created or imported', showForOld: false, showForNew: false},
  { name: 'tilesetid', key: 'Mapbox ID',hint: 'The unique identifier of the feature tileset in Mapbox', showForOld: false, showForNew: false},
  { name: 'area', key: 'Total area',hint: 'The total area for the feature in Km2 (i.e. globally)', showForOld: false, showForNew: false},
  { name: 'target_value', key: 'Target percent',hint: 'The target percentage for the feature within the planning grid', showForOld: true, showForNew: true},
  { name: 'spf', key: 'Species Penalty Factor',hint: 'The species penalty factor is used to weight the likelihood of getting a species in the results', showForOld: true, showForNew: true},
  { name: 'preprocessed', key: 'Preprocessed',hint: 'Whether or not the feature has been intersected with the planning units', showForOld: false, showForNew: true},
  { name: 'pu_count', key: 'Planning unit count',hint: 'The number of planning units that intersect the feature (calculated during pre-processing)', showForOld: true, showForNew: true},
  { name: 'pu_area', key: 'Planning grid area',hint: 'The area of the feature within the planning grid in Km2 (calculated during pre-processing)', showForOld: true, showForNew: true},
  { name: 'target_area', key: 'Target area',hint: 'The total area that needs to be protected to achieve the target percentage in Km2 (calculated during a Marxan Run)', showForOld: true, showForNew: true},
  { name: 'protected_area', key: 'Area protected',hint: 'The total area protected in the current solution in Km2 (calculated during a Marxan Run)', showForOld: true, showForNew: true}];

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      marxanServers: [],
      marxanServer: {},
      usersDialogOpen: false,
      alertDialogOpen: false,
      featureMenuOpen: false,
      profileDialogOpen: false,
      aboutDialogOpen: false,
      helpDialogOpen: false,
      importProjectDialogOpen: false,
      optionsDialogOpen: false,
      CostsDialogOpen: false,
      registerDialogOpen: false,
      clumpingDialogOpen: false,
      settingsDialogOpen: false,
      projectsDialogOpen: false,
      openInfoDialogOpen: false,
      newProjectDialogOpen: false, 
      shareableLinkDialogOpen: false,
      classificationDialogOpen: false,
      resendPasswordDialogOpen: false,
      NewPlanningGridDialogOpen: false, 
      importPlanningGridDialogOpen: false,
      FailedToDeleteDialogOpen: false,
      changePasswordDialogOpen: false,
      importFeaturesDialogOpen: false,
      serverDetailsDialogOpen: false,
      planningGridsDialogOpen: false,
      planningGridDialogOpen: false,
      NewFeatureDialogOpen: false,
      featuresDialogOpen: false,
      featureDialogOpen: false,
      runLogDialogOpen: false,
      infoPanelOpen: false,
      resultsPanelOpen: false,
      targetDialogOpen: false,
      guestUserEnabled: true,
      userMenuOpen: false,
      helpMenuOpen: false,
      users: [],
      user: '', 
      password: '',
      project: '',
      failedToDeleteProjects: [],
      owner: '', // the owner of the project - may be different to the user, e.g. if logged on as guest (user) and accessing someone elses project (owner)
      loggedIn: false,
      shareableLink: false,
      userData: {},
      unauthorisedMethods: [],
      metadata: {},
      renderer: {},
      runParams: [],
      files: {},
      popup_point: { x: 0, y: 0 },
      snackbarOpen: false,
      snackbarMessage: '',
      tilesets: [],
      puFeatures: [],
      paFeatures: [],
      loading: false,
      preprocessing: false,
      pa_layer_visible: false,
      currentFeature:{},
      puvsprLayerText: '',
      featureDatasetFilename: '',
      dataBreaks: [],
      allFeatures: [], //all of the interest features in the metadata_interest_features table
      projectFeatures: [], //the features for the currently loaded project
      selectedFeatureIds :[],
      addingRemovingFeatures: false,
      resultsLayerPaintProperty: {},
      results_layer_opacity: RESULTS_LAYER_FILL_OPACITY_ACTIVE, //initial value
      wdpa_layer_opacity: WDPA_FILL_LAYER_OPACITY, //initial value
      costs: [],
      selectedCosts: [],
      countries: [],
      planning_units: [],
      planning_unit_grids: [],
      planning_grid_metadata:{},
      feature_metadata:{},
      activeTab: "project",
      activeResultsTab: "legend",
      logMessages: [],
      clumpingRunning: false,
      deleteWhat:'',
      pid: 0,
      basemaps: [],
      basemap: 'North Star',
      mapCentre: {lng: 0, lat: 0},
      mapZoom: 12,
      runLogs:[],
      puEditing: false,
      wdpaAttribution: "",
      shareableLinkUrl: ""
    };
  }

  componentDidMount() {
    //if this is a shareable link, then dont show the login form
    if (window.location.search !== "") this.setState({loggedIn: true, shareableLink: true});
    //parse the application level variables from the Marxan Registry
    this.getGlobalVariables().then(()=>{
      //automatically login if this is a shareable link
      if (window.location.search !== "") {
        //get the query parameters
        var searchParams = new URLSearchParams(window.location.search);
        //open the shareable link
        this.openShareableLink(searchParams);
      }
    });
    //instantiate the classybrew to get the color ramps for the renderers
    this.setState({ brew: new classyBrew() });
  }
  
  //gets various global variables from the marxan registry
  getGlobalVariables(){
    return new Promise((resolve, reject) => {
      mapboxgl.accessToken = window.MBAT_PUBLIC; //this is my public access token 
      //initialise the basemaps
      this.setState({basemaps: window.MAPBOX_BASEMAPS});
      //get all the information for the marxan servers by polling them
      this.initialiseServers(window.MARXAN_SERVERS).then((response)=>{
        resolve(response);
      });
    });
  }
  
  //automatically logs in and loads a project as a guest user
  openShareableLink(searchParams){
    try {
      if (searchParams.has("server") && searchParams.has("user") && searchParams.has("project")){
        //get the server data from the servers object
        let serverData = this.state.marxanServers.find(server => server.name === searchParams.get("server"));
        if (serverData === undefined) throw new Error("Invalid server parameter on shareable link");
        if (serverData && serverData.offline) throw new Error("Server is offline");
        if (serverData && !serverData.guestUserEnabled) throw new Error("Guest user is not enabled on the server");
        //set the server
        this.selectServer(serverData);
        //switch to the guest user
        this.switchToGuestUser().then(()=>{
          //login
          this.validateUser().then((response)=>{
            this.loadProject(searchParams.get("project"),searchParams.get("user")).then(()=>{
              //hide the loading dialog
              this.setState({shareableLink:false});
            });
          });
        });
      }else{
        throw new Error("Invalid query parameters on shareable link");
      }
    }
		catch (err) {
		  alert(err);
		}
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// REQUEST HELPERS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //makes a GET request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  _get(params, timeout = TIMEOUT){
    return new Promise((resolve, reject) => {
      //set the global loading flag
      this.setState({loading: true});
      jsonp(this.state.marxanServer.endpoint + params, { timeout: timeout }).promise.then((response) => {
        this.setState({loading: false});
        if (!this.checkForErrors(response)) {
          resolve(response);
        }
        else {
          reject(response.error);
        }
      }, (err) => {
        this.setState({loading: false});
        this.setSnackBar("Request timeout - See <a href='" + ERRORS_PAGE + "#request-timeout' target='blank'>here</a>");
        reject(err);
      });
    });
  }
 
  //makes a POST request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  _post(method, formData, timeout = TIMEOUT, withCredentials = SEND_CREDENTIALS){
    return new Promise((resolve, reject) => {
      //set the global loading flag
      this.setState({loading: true});
      post(this.state.marxanServer.endpoint + method, formData, {withCredentials: withCredentials}).then((response) => {
        if (!this.checkForErrors(response.data)) {
          this.setState({loading: false});
          resolve(response.data);
        }
        else {
          this.setState({loading: false});
          reject(response.data.error);
        }
      }, (err) => {//TODO - If the request is unauthorised it returns the Status Code of 200 with the error: "HTTP 403: Forbidden (The 'ReadOnly' role does not have permission to access the 'updateSpecFile' service)" - but for some reason this error handling is used
        this.setState({loading: false});
        this.setSnackBar(err.message);
        reject(err);
      });
    });
  }
 
  //web socket requests
  _ws(params, msgCallback){
    return new Promise((resolve, reject) => {
      let ws = new WebSocket(this.state.marxanServer.websocketEndpoint + params);
      //get the message and pass it to the msgCallback function
      ws.onmessage = (evt) => {
        let message = JSON.parse(evt.data);
        //check for errors
        if (!this.checkForErrors(message)){
          if (message.status === "Finished"){
            //pass the message back to the callback
            msgCallback(message);
            //reset state
            this.setState({preprocessing: false});
            //if the web socket has finished then resolve the promise
            resolve(message);
          }else{
            msgCallback(message);
          }
        }else{
          //pass the message back to the callback
          msgCallback(message);
          //reset state
          this.setState({preprocessing: false});
          reject(message.error);
        }
      };
      ws.onopen = (evt) => {
        //do something if necessary
      };
      ws.onerror = (evt) => {
        //reset state
        this.setState({preprocessing: false});
        reject(evt);
      };
      ws.onclose = (evt) => {
        //reset state
        this.setState({preprocessing: false});
        if (!evt.wasClean) {
          msgCallback({status:'SocketClosed'});
        }else{
          reject(evt);
        }
      };
    });
  }
  
  //checks the reponse for errors
  checkForErrors(response, showSnackbar = true) {
    let networkError = this.responseIsTimeoutOrEmpty(response, showSnackbar);
    //check the response from the server for an error property - if it has one then show it in the snackbar
    let serverError = this.isServerError(response, showSnackbar);
    let isError = (networkError || serverError);
    if (isError) {
      //write the full trace to the console if available
      let error = (response.hasOwnProperty('trace')) ? response.trace : (response.hasOwnProperty('error')) ? response.error : "No error message returned";
      console.error("Error message from server: " + error);
    }
    return isError;
  }

  //checks the response from a REST call for timeout errors or empty responses
  responseIsTimeoutOrEmpty(response, showSnackbar = true) {
    if (!response) {
      let msg = "No response received from server";
      if (showSnackbar) this.setSnackBar(msg);
      return true;
    }
    else {
      return false;
    }
  }

  //checks to see if the rest server raised an error and if it did then show in the snackbar
  isServerError(response, showSnackbar) {
    //errors may come from the marxan server or from the rest server which have slightly different json responses
    if ((response && response.error) || (response && response.hasOwnProperty('metadata') && response.metadata.hasOwnProperty('error') && response.metadata.error != null)) {
      var err = (response.error) ? (response.error) : response.metadata.error;
      if (showSnackbar) this.setSnackBar(err);
      return true;
    }
    else {
      //some server responses are warnings and will not stop the function from running as normal
      if (response.warning) {
        if (showSnackbar) this.setSnackBar( response.warning);
      }
      return false;
    }
  }

  //called when any websocket message is received - this logic removes duplicate messages
  wsMessageCallback(message){
    //dont log any clumping projects
    if (this.state.clumpingRunning) return;
    //log the message if necessary
    this.logMessage(message);
    switch (message.status) {
      case 'Started': //from both asynchronous queries and marxan runs
      case "Updating WDPA":
        //set the processing state when the websocket starts
        this.setState({preprocessing: true});
        break;
      case 'pid': //from marxan runs and preprocessing - the pid is an identifer and the pid, e.g. m1234 is a marxan run process with a pid of 1234
        this.setState({pid: message.pid});
        break;
      case "FeatureCreated":
        this.newFeatureCreated(message.id);
        break;
      case 'Finished': //from both asynchronous queries and marxan runs
        //reset the pid
        this.setState({pid: 0});
        break;
      default:
        break;
    }
  }
  
  //logs the message if necessary - this removes duplicates
  logMessage(message){
    //log the message from the websocket
    if (message.status === 'SocketClosed'){ //server closed WebSocket unexpectedly - uncaught server error, server crash or WebSocket timeout)
      this.log({method:message.method, status:'Finished', error:"The WebSocket connection closed unexpectedly"});
    }else{
      //see if the message has a pid and if it does then see if the status has changed from the last message - if it has then log the message
      if (message.hasOwnProperty('pid')) {
        //get the existing status
        let _messages = this.state.logMessages.filter((_message) => {
          if (_message.hasOwnProperty('pid')) {
            return _message.pid === message.pid;
          }else{
            return false;
          }
        });
        //if there is already a message for that pid
        if (_messages.length > 0){
          //compare with the latest status
          if (message.status !== _messages[_messages.length-1].status) {
            //if the new status is different and the message status is finished, then remove the processing message
            if (message.status === 'Finished') this.removeMessageFromLog('RunningQuery', message.pid);
            this.log(message);
          }
        }else{ //log the first message for that pid
          this.log(message);
        }
      }else{
        //for downloading we dont want to show every downloading message
        if (message.status === 'Downloading'){
          //see if we already have a message which is downloading 
          let _messages = this.state.logMessages.filter((_message) => {
            return (_message.status === 'Downloading');
          });
          if (_messages.length === 0) this.log(message);
        }else{
          //if the message is downloaded then remove the downloading message
          if (message.status === 'Downloaded') this.removeMessageFromLog('Downloading');
          this.log(message);
        }
      }
    }
  }
  
  //removes a message from the log by matching on the status and if it is passed, the pid
  removeMessageFromLog(status, pid){
    let _messages = this.state.logMessages;
    //filter the messages to remove those that match on status (and pid)
    _messages = _messages.filter((_message) => {
      if (pid !== undefined){
        if (_message.hasOwnProperty('pid')) {
          return (!(_message.pid === pid && _message.status === status));
        }else{
          return true;
        }
      }else{ //match just on the status
        return (!(_message.status === status));
      }
    });
    this.setState({logMessages: _messages});
  }
  
  //can be called from other components
  setSnackBar(message, silent = false){
    if (!silent) this.setState({snackbarOpen: true, snackbarMessage: message});
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// MANAGING MARXAN SERVERS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //initialises the servers by requesting their capabilities and then filtering the list of available servers
  initialiseServers(marxanServers){
    return new Promise((resolve, reject) => {
      //get a list of server hosts from the marxan.js registry
      let hosts = marxanServers.map((server) => {
        return server.host;  
      });
      //add the current domain - this may be a local/local network install
      let name = (window.location.hostname === "localhost") ? "localhost" : window.location.hostname;
      marxanServers.push(({name: name, protocol: window.location.protocol, host: window.location.hostname, port: 8080, description:'Local machine', type:'local', }));
      //get all the server capabilities - when all the servers have responded, finalise the marxanServer array
      this.getAllServerCapabilities(marxanServers).then((server) => {
        //remove the current domain if either the marxan server is not installed, or it is already in the list of servers from the marxan registry
        marxanServers = marxanServers.filter((item) => {
          return (item.type==="remote" || (item.type==="local" && !item.offline && hosts.indexOf(item.host) === -1) || (item.host === 'localhost'));
        });
        //sort the servers by the name 
        marxanServers.sort((a, b) => {
          if ((a.name.toLowerCase() < b.name.toLowerCase())||(a.type === "local"))
            return -1;
          if (a.name.toLowerCase() > b.name.toLowerCase())
            return 1;
          return 0;
        });
        this.setState({marxanServers: marxanServers}, ()=>{
          resolve("ServerData retrieved");
        });
      });
    });
  }  

  //gets the capabilities of all servers
  getAllServerCapabilities(marxanServers){
    let promiseArray = [];
    //iterate through the servers and get their capabilities
    for (var i = 0; i < marxanServers.length; ++i) {
      promiseArray.push(this.getServerCapabilities(marxanServers[i]));
    }
    //return a promise
    return Promise.all(promiseArray);
  }

  //gets the capabilities of the server by making a request to the getServerData method
  getServerCapabilities(server){
    return new Promise((resolve, reject) => {
      //get the endpoint for all http/https requests
      let endpoint = server.protocol + "//" + server.host + ":" + server.port + TORNADO_PATH;
      //get the WebService endpoint
      let websocketEndpoint = (server.protocol ==='http:') ? "ws://" + server.host + ":" + server.port + TORNADO_PATH : "wss://" + server.host + ":" + server.port + TORNADO_PATH;
      //set the default properties for the server - by default the server is offline, has no guest access and CORS is not enabled
      server = Object.assign(server, {endpoint: endpoint, websocketEndpoint: websocketEndpoint, offline: true, guestUserEnabled: false, corsEnabled: false});
      //poll the server to make sure tornado is running - this uses fetchJsonp which can catch http errors
      fetchJsonp(endpoint + "getServerData",{timeout: 1000}).then((response) => {
        return response.json();
      }).then((json) => {
        if (json.hasOwnProperty('info')){
          //see if CORS is enabled from this domain - either the domain has been added as an allowable domain on the server, or the client and server are on the same machine
          let corsEnabled = ((json.serverData.PERMITTED_DOMAINS.indexOf(window.location.hostname)>-1)||(server.host === window.location.hostname)) ? true : false;
          //set the flags for the server capabilities
          server = Object.assign(server, {guestUserEnabled: json.serverData.ENABLE_GUEST_USER, corsEnabled: corsEnabled, offline: false, machine: json.serverData.MACHINE, client_version: json.serverData.MARXAN_CLIENT_VERSION, server_version: json.serverData.MARXAN_SERVER_VERSION, node: json.serverData.NODE, processor: json.serverData.PROCESSOR, release: json.serverData.RELEASE, system:json.serverData.SYSTEM, version: json.serverData.VERSION, wdpa_version: json.serverData.WDPA_VERSION, planning_grid_units_limit: Number(json.serverData.PLANNING_GRID_UNITS_LIMIT)});
          //if the server defines its own name then set it 
          if(json.serverData.SERVER_NAME!=="") {
            server = Object.assign(server, {name:json.serverData.SERVER_NAME});
          }
          //if the server defines its own description then set it 
          if(json.serverData.SERVER_DESCRIPTION!=="") {
            server = Object.assign(server, {description:json.serverData.SERVER_DESCRIPTION});
          }
        }
        //return the server capabilities
        resolve(server);
        }).catch((ex) => {
          //the server does not exist or did not respond before the timeout - return the default properties
          resolve(server);
      });
    });
  }
  
  //sets the layer name for the WDPA vector tiles based on the WDPA version
  setWDPAVectorTilesLayerName(wdpa_version){
    //get the short version of the wdpa_version, e.g. August 2019 to aug_2019
    let version = wdpa_version.toLowerCase().substr(0,3) + "_" + wdpa_version.substr(-4);
    //set the value of the vector_tile_layer based on which version of the wdpa the server has in the PostGIS database
    this.wdpa_vector_tile_layer = "wdpa_" + version + "_polygons";
  }
  //called when the user selects a server
  selectServer(value){
    this.setState({marxanServer: value});
    //set the link to the WDPA vector tiles based on the version that is included in the server in the PostGIS database
    this.setWDPAVectorTilesLayerName(value.wdpa_version);
    //if the server is ready only then change the user/password to the guest user
    if (!value.offline && !value.corsEnabled && value.guestUserEnabled){
      this.switchToGuestUser();
    }
  }
  
  closeSnackbar() {
    this.setState({ snackbarOpen: false });
  }

  startLogging(clearLog = false){
    //switches the results pane to the log tab
    this.log_tab_active();
    //clear the log if needs be
    if (clearLog) this.clearLog();
  }

  //clears the log
  clearLog(){
    this.setState({logMessages: []});
  }
  
  //can be called from components to update the log
  log(message){
    let _messages = this.state.logMessages;
    _messages.push(message);
    this.setState({logMessages: _messages});
  }

  //utiliy method for getting all puids from normalised data, e.g. from [["VI", [7, 8, 9]], ["IV", [0, 1, 2, 3, 4]], ["V", [5, 6]]]
  getPuidsFromNormalisedData(normalisedData) {
    let puids = [];
    normalisedData.forEach((item) => {
      puids = puids.concat(item[1]);
    });
    return puids;
  }

  changeUserName(user) {
    this.setState({ user: user });
  }

  changePassword(password) {
    this.setState({ password: password });
  }
  
  //checks the users credentials
  checkPassword(user, password) {
    return new Promise((resolve, reject) => {
      this._get("validateUser?user=" +user + "&password=" + password, 10000).then((response) => {
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }
  //validates the user and then logs in if successful
  validateUser() {
    return new Promise((resolve, reject) => {
      this.checkPassword(this.state.user, this.state.password).then(() => {
        //user validated - log them in
        this.login().then((response)=>{
          resolve("User validated");
        });
      }).catch((error) => {
        //do something
      });
    });
  }

  //the user is validated so login
  login() {
    return new Promise((resolve, reject) => {
      this._get("getUser?user=" + this.state.user).then((response) => {
        //set the data for the user 
        this.setState({userData: response.userData, unauthorisedMethods: response.unauthorisedMethods, project: response.userData.LASTPROJECT}, ()=>{
          //set the basemap based on the users data
          this.setBasemap(this.state.basemaps.filter((item) => {return (item.name === response.userData.BASEMAP);})[0]);
          //get all features
          this.getAllFeatures().then(() => {
            //get the users last project and load it 
            this.loadProject(this.state.userData.LASTPROJECT, this.state.user).then((response)=>{
              resolve("Logged in");
            });
          });
          //get all planning grids
          this.getPlanningUnitGrids();
          //see if there is a new version of the wdpa data - this comes from the Marxan Registry WDPA object - if there is then show the alert message to admin users
          ((this.state.marxanServer.wdpa_version !== window.WDPA.latest_version) && (this.state.userData.ROLE === 'Admin')) ? this.setState({newWDPAVersion: true, alertDialogOpen: true}) : this.setState({newWDPAVersion: false, alertDialogOpen: false});
        });
      }).catch((error) => {
        //do something
      });
    });
  }
  
  //sets the basemap
  setBasemap(basemap){
    this.setState({basemap: basemap});
  }
  
  //log out and reset some state 
  logout() {
    this.hideUserMenu();
    this.setState({ loggedIn: false, user: '', password: '', project: '',owner: '', runParams: [], files: {}, metadata: {}, renderer: {}, planning_units: [], projectFeatures:[], infoPanelOpen: false, resultsPanelOpen: false, brew: new classyBrew()  });
    this.resetResults();
    //clear the currently set cookies
    this._get("logout").then((response) => {
        //do something
    });
  }
  
  switchToGuestUser(){
    return new Promise((resolve, reject) => {
      this.setState({user: "guest", password:"password"}, ()=> {
        resolve("Switched to guest user");
      });
    });
  }
  
  changeEmail(value) { 
      this.setState({ resendEmail: value });
  }

  resendPassword() {
    this._get("resendPassword?user=" + this.state.user).then((response) => {
      //ui feedback
      this.setSnackBar(response.info);
      //close the resend password dialog
      this.closeResendPasswordDialog();
    }).catch((error) => {
      //do something
  	});
  }

  //gets data for all users
  getUsers() {
    this._get("getUsers").then((response) => {
      this.setState({ users: response.users });
    }).catch((error) => {
      this.setState({ users: [] });
    });
  }

  //deletes a user
  deleteUser(user) {
    this._get("deleteUser?user=" + user).then((response) => {
      this.setSnackBar("User deleted");
      //remove it from the users array
      let usersCopy = this.state.users;
      //remove the user 
      usersCopy = usersCopy.filter((item) => {return item.user !== user});
      //update the users state   
      this.setState({users: usersCopy});
      //see if the current project belongs to the deleted user
      if (this.state.owner === user) {
        this.setSnackBar("Current project no longer exists. Loading next available.");
        //load the next available project
        this.state.projects.some((project) => {
          if (project.user !== user) this.loadProject(project.name, project.user);
          return project.name !== this.state.project;
        });
        //delete all the projects belonging to that user
        this.deleteProjectsForUser(user);
      }
    });
  }
  
  //deletes all of the projects belonging to the passed user from the state
  deleteProjectsForUser(user){
    let projects = this.state.projects.map((project) => {
      return (project.user !== user);
    });
    this.setState({projects: projects});
  }
  
  //changes a users role
  changeRole(user, role){
    this.updateUser({ROLE: role}, user);
    //copy the users state
    let usersCopy = this.state.users;
    //change the users role
    usersCopy = usersCopy.map((item) => {
      if (item.user === user){
        return Object.assign(item, {'ROLE': role});
      }else{
        return item;
      }      
    });
    //update the users state   
    this.setState({users: usersCopy});
  }

  //toggles if the guest user is enabled on the server or not
  toggleEnableGuestUser(){
    this._get("toggleEnableGuestUser").then((response) => {
      //if succesfull set the state
      this.setState({ guestUserEnabled: response.enabled });
    });
  }
  
  //toggles the projects privacy
  toggleProjectPrivacy(newValue){
    this.updateProjectParameter("PRIVATE", newValue).then((response) => {
      this.setState({ metadata: Object.assign(this.state.metadata, { PRIVATE: (newValue === "True") })});
    });
  }
  
  appendToFormData(formData, obj) {
    //iterate through the object and add each key/value pair to the formData to post to the server
    for (var key in obj) {
      //only add non-prototype objects
      if (obj.hasOwnProperty(key)) {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  //removes the keys from the object
  removeKeys(obj, keys) {
    keys.map((key) => {
      delete obj[key];
      return null;
    });
    return obj;
  }

  //updates all parameter in the user.dat file then updates the state (in userData)
  updateUser(parameters, user = this.state.user) {
    return new Promise((resolve, reject) => {
      //remove the keys that are not part of the users information
      parameters = this.removeKeys(parameters, ["updated", "validEmail"]);
      //initialise the form data
      let formData = new FormData();
      //add the current user
      formData.append("user", user);
      //append all the key/value pairs
      this.appendToFormData(formData, parameters);
      //post to the server
      this._post("updateUserParameters", formData).then((response) => {
        // if succesfull write the state back to the userData key
        if (this.state.user === user) this.setState({ userData: this.newUserData});
        this.setState({optionsDialogOpen: false });
        resolve();
      }).catch((error) => {
        reject(error);
      });
      //if we have updated the current user then save a local property so that if the changes are saved to the server then we can update the local state
      if (this.state.user === user) this.newUserData = Object.assign(this.state.userData, parameters);
    });
  }

  //saveOptions - the options are in the users data so we use the updateUser REST call to update them
  saveOptions(options) {
    //hide the popup 
    this.hidePopup();
    this.updateUser(options);
  }
  //updates the project from the old version to the new version
  upgradeProject(project){
    return this._get("upgradeProject?user=" + this.state.user + "&project=" + project);
  }
  
  //updates the project parameters back to the server (i.e. the input.dat file)
  updateProjectParams(project, parameters) {
    //initialise the form data
    let formData = new FormData();
    //add the current user
    formData.append("user", this.state.owner);
    //add the current project
    formData.append("project", project);
    //append all the key/value pairs
    this.appendToFormData(formData, parameters);
    //post to the server and return a promise
    return this._post("updateProjectParameters", formData);
  }

  //updates a single parameter in the input.dat file directly
  updateProjectParameter(parameter, value) {
    let obj = {};
    obj[parameter] = value;
    //update the parameter and return a promise
    return this.updateProjectParams(this.state.project, obj);
  }

  //updates the run parameters for the current project
  updateRunParams(array) {
    //convert the run parameters array into an object
    let parameters = {};
    array.map((obj) => { parameters[obj.key] = obj.value; return null; });
    //update the project parameters
    this.updateProjectParams(this.state.project, parameters).then((response) => {
      //if succesfull write the state back 
      this.setState({ runParams: this.runParams});
    });
    //save the local state to be able to update the state on callback
    this.runParams = array;
  }

  //gets the planning unit grids
  getPlanningUnitGrids() {
    this._get("getPlanningUnitGrids").then((response) => {
      this.setState({ planning_unit_grids: response.planning_unit_grids });
    });
  }

  //loads a project
  loadProject(project, user) {
    return new Promise((resolve, reject) => {
      //reset the results from any previous projects
      this.resetResults();
      this._get("getProject?user=" + user + "&project=" + project).then((response) => {
        //set the state for the app based on the data that is returned from the server
        this.setState({ loggedIn: true, project: response.project, owner: user, runParams: response.runParameters, files: Object.assign(response.files), metadata: response.metadata, renderer: response.renderer, planning_units: response.planning_units, infoPanelOpen: true, resultsPanelOpen: true  });
        //if there is a PLANNING_UNIT_NAME passed then load this planning grid - planningGridLoaded will be called
        if (response.metadata.PLANNING_UNIT_NAME) this.setState({tilesetid: response.metadata.PLANNING_UNIT_NAME});
        //set a local variable for the feature preprocessing - this is because we dont need to track state with these variables as they are not bound to anything
        this.feature_preprocessing = response.feature_preprocessing;
        //set a local variable for the protected area intersections - this is because we dont need to track state with these variables as they are not bound to anything
        this.protected_area_intersections = response.protected_area_intersections;
        //set a local variable for the selected iucn category
        this.previousIucnCategory = response.metadata.IUCN_CATEGORY;
        //initialise all the interest features with the interest features for this project
        this.initialiseInterestFeatures(response.metadata.OLDVERSION, response.features);
      }).catch((error) => {
          if (error.indexOf('Logged on as read-only guest user')>-1){
            this.setState({loggedIn: true});
            resolve("No project loaded - logged on as read-only guest user'");
          }
          if (error.indexOf("does not exist")>-1){
            //probably the last loaded project has been deleted - send some feedback and load another project
            this.setSnackBar("Loading first available project");
            //passing an empty project to loadProject will load the first project
            this.loadProject('', this.state.user);
          }
      });
    });
  }
  
  //called when the planning grid has loaded
  planningGridLoaded(){
    //poll the server to see if results are available for this project - if there are these will be loaded
    this.getResults(this.state.owner, this.state.project);
  }
  
  //matches and returns an item in an object array with the passed id - this assumes the first item in the object is the id identifier
  getArrayItem(arr, id) {
    let tmpArr = arr.filter((item) => { return item[0] === id });
    let returnValue = (tmpArr.length > 0) ? tmpArr[0] : undefined;
    return returnValue;
  }

  //initialises the interest features based on the currently loading project
  initialiseInterestFeatures(oldVersion, projectFeatures) {
    //if the project is from an old version of marxan then the interest features can only come from the list of features in the current project
    let features = (oldVersion) ? JSON.parse(JSON.stringify(projectFeatures)) : this.state.allFeatures; //make a copy of the projectFeatures
    //get a list of the ids for the features that are in this project
    var ids = projectFeatures.map((item) => {
      return item.id;
    });
    //iterate through features to add the required attributes to be used in the app and to populate them based on the current project features
    var outFeatures = features.map((item) => {
      //see if the feature is in the current project
      var projectFeature = (ids.indexOf(item.id) > -1) ? projectFeatures[ids.indexOf(item.id)] : null;
      //get the preprocessing for that feature from the feature_preprocessing.dat file
      let preprocessing = this.getArrayItem(this.feature_preprocessing, item.id);
      //add the required attributes to the features - these will be populated in the function calls preprocessFeature (pu_area, pu_count) and pollResults (protected_area, target_area)
      this.addFeatureAttributes(item, oldVersion);
      //if the interest feature is in the current project then populate the data from that feature
      if (projectFeature) {
        item['selected'] = true;
        item['preprocessed'] = preprocessing ? true : false;
        item['pu_area'] = preprocessing ? preprocessing[1] : -1;
        item['pu_count'] = preprocessing ? preprocessing[2] : -1;
        item['spf'] = projectFeature['spf'];
        item['target_value'] = projectFeature['target_value'];
        item['occurs_in_planning_grid'] = item['pu_count'] > 0;
      }
      return item;
    });
    //get the selected feature ids
    this.getSelectedFeatureIds();
    //set the state
    this.setState({ allFeatures: outFeatures, projectFeatures: outFeatures.filter((item) => { return item.selected }) });
  }

  //adds the required attributes for the features to work in the marxan web app - these are the default values
  addFeatureAttributes(item, oldVersion){
      // the -1 flag indicates that the values are unknown
      item['selected'] = false;
      item['preprocessed'] = false;
      item['pu_area'] = -1;
      item['pu_count'] = -1;
      item['spf'] = 40;
      item['target_value'] = 17;
      item['target_area'] = -1;
      item['protected_area'] = -1;
      item['feature_layer_loaded'] = false;
      item['old_version'] = oldVersion;
      item['occurs_in_planning_grid'] = false;
  }

  //resets various variables and state in between users
  resetResults() {
    this.runMarxanResponse = {};
    this.setState({ solutions: []});
    //reset any feature layers that are shown
    this.hideFeatureLayer();
    //reset the puvspr layer
    this.hideLayer(PUVSPR_LAYER_NAME);
  }

  //create a new user on the server
  createNewUser(user, password, name, email) {
    let formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);
    formData.append('fullname', name);
    formData.append('email', email);
    this._post("createUser", formData).then((response) => {
      //ui feedback
      this.setSnackBar(response.info);
      //close the register dialog
      this.closeRegisterDialog();
      //enter the new users name in the username box and a blank password
      this.setState({user: user, password:''});
    });
  }

  //REST call to create a new project from the wizard
  createNewProject(project) {
    let formData = new FormData();
    formData.append('user', this.state.user);
    formData.append('project', project.name);
    formData.append('description', project.description);
    formData.append('planning_grid_name', project.planning_grid_name);
    var interest_features = [];
    var target_values = [];
    var spf_values = [];
    project.features.forEach((item) => {
      interest_features.push(item.id);
      target_values.push(17);
      spf_values.push(40);
    });
    //prepare the data that will populate the spec.dat file
    formData.append('interest_features', interest_features.join(","));
    formData.append('target_values', target_values.join(","));
    formData.append('spf_values', spf_values.join(","));
    this._post("createProject", formData).then((response) => {
      this.setSnackBar(response.info);
      this.setState({projectsDialogOpen: false });
      this.loadProject(response.name, response.user);
    });
  }

  //REST call to create a new import project from the wizard
  createImportProject(project) {
    let formData = new FormData();
    formData.append('user', this.state.user);
    formData.append('project', project);
    return this._post("createImportProject", formData);
  }

  //REST call to delete a specific project
  deleteProject(user, project, silent = false) {
    this._get("deleteProject?user=" + user + "&project=" + project).then((response) => {
      //refresh the projects list
      this.getProjects();
      //ui feedback
      this.setSnackBar(response.info, silent); //we may not want to show the snackbar if we are deleting a project silently, e.g. on a rollback after an unsuccesful import
      //see if the user deleted the current project
      if (response.project === this.state.project) {
        //ui feedback
        this.setSnackBar("Current project deleted - loading first available");
        //load the next available project
        this.state.projects.some((project) => {
          if (project.name !== this.state.project) this.loadProject(project.name, this.state.user);
          return project.name !== this.state.project;
        });
      }
    });
  }

  cloneProject(user, project) {
    this._get("cloneProject?user=" + user + "&project=" + project).then((response) => {
      //refresh the projects list
      this.getProjects();
      //ui feedback
      this.setSnackBar(response.info);
    }).catch((error) => {
        //do something
    });
  }

  //rename a specific project on the server
  renameProject(newName) {
    return new Promise((resolve, reject) => {
      if (newName !== '' && newName !== this.state.project) {
        this._get("renameProject?user=" + this.state.owner + "&project=" + this.state.project + "&newName=" + newName).then((response) => {
          this.setState({ project: newName});
          this.setSnackBar(response.info);
          resolve("Project renamed");
        }).catch((error) => {
          //do something
        });
      }
    });
  }
  //rename the description for a specific project on the server
  renameDescription(newDesc) {
    return new Promise((resolve, reject) => {
      this.updateProjectParameter("DESCRIPTION", newDesc).then((response) => {
        this.setState({ metadata: Object.assign(this.state.metadata, { DESCRIPTION: newDesc })});
        resolve("Description renamed");
      });
    });
  }

  getProjects() {
    this._get("getProjects?user=" + this.state.user).then((response) => {
      let projects = [];
      //filter the projects so that private ones arent shown
      response.projects.forEach((project) => {
        if (!(project.private && project.user !== this.state.user && this.state.userData.ROLE !== "Admin")) projects.push(project);
      });
      this.setState({ projects: projects});
    });
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////CODE TO PREPROCESS AND RUN MARXAN
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //run a marxan job on the server
  runMarxan(e) {
    //start the logging
    this.startLogging();
    //reset all of the protected and target areas for all features
    this.resetProtectedAreas();
    //update the spec.dat file with any that have been added or removed or changed target or spf
    this.updateSpecFile().then((value)=> {
      //when the species file has been updated, update the planning unit file 
      this.updatePuFile();
      //when the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using websockets
      this.updatePuvsprFile().then((value) => {
        //start the marxan job
        this.startMarxanJob(this.state.owner, this.state.project).then((response) => {
          //update the run log
          this.getRunLogs();
          if (!this.checkForErrors(response)) {
            //run completed - get the results
            this.getResults(response.user, response.project);
          }else{
            //set state with no solutions
            this.runFinished([]);
          }
        }).catch((error) => {
            //reset the running state
            this.marxanStopped(error);
        }); //startMarxanJob
      }).catch((error) => { //updatePuvsprFile error
        console.error(error);
      }); 
    }).catch((error) => { //updateSpecFile error
      console.error(error);
    });
  }

  //stops a process running on the server
  stopProcess(pid) {
    this._get("stopProcess?pid=" + pid, 10000).catch((error) => {
      //if the pid no longer exists then the state needs to be reset anyway
      this.getRunLogs();
    });
  }

  //ui feedback when marxan is stopped by the user
  marxanStopped(error){
    //update the run log
    this.getRunLogs();
  }
  
  resetProtectedAreas() {
    //reset all of the results for allFeatures to set their protected_area and target_area to -1
    this.state.allFeatures.forEach((feature) => {
      feature.protected_area = -1;
      feature.target_area = -1;
    });
  }

  //updates the species file with any target values that have changed
  updateSpecFile() {
    let formData = new FormData();
    formData.append('user', this.state.owner);
    formData.append('project', this.state.project);
    var interest_features = [];
    var target_values = [];
    var spf_values = [];
    this.state.projectFeatures.forEach((item) => {
      interest_features.push(item.id);
      target_values.push(item.target_value);
      spf_values.push(item.spf);
    });
    //prepare the data that will populate the spec.dat file
    formData.append('interest_features', interest_features.join(","));
    formData.append('target_values', target_values.join(","));
    formData.append('spf_values', spf_values.join(","));
    return this._post("updateSpecFile", formData);
  }

  //updates the planning unit file with any changes - not implemented yet
  updatePuFile() {

  }

  updatePuvsprFile() {
    //preprocess the features to create the puvspr.dat file on the server - this is done on demand when the project is run because the user may add/remove Conservation features willy nilly
    let promise = this.preprocessAllFeatures();
    return promise;
  }

  //preprocess a single feature
  async preprocessSingleFeature(feature){
    this.closeFeatureMenu();
    this.startLogging();
    this.preprocessFeature(feature);
  }
  
  //preprocess synchronously, i.e. one after another
  async preprocessAllFeatures() {
    var feature;
    //iterate through the features and preprocess the ones that need preprocessing
    for (var i = 0; i < this.state.projectFeatures.length; ++i) {
      feature = this.state.projectFeatures[i];
      if (!feature.preprocessed){
        await this.preprocessFeature(feature);
      }else{
        //
      }
    }
  }

  //preprocesses a feature using websockets - i.e. intersects it with the planning units grid and writes the intersection results into the puvspr.dat file ready for a marxan run - this will have no server timeout as its running using websockets
  preprocessFeature(feature) {
    return new Promise((resolve, reject) => {
      //switches the results pane to the log tab
      this.log_tab_active();
      //call the websocket 
      this._ws("preprocessFeature?user=" + this.state.owner + "&project=" + this.state.project + "&planning_grid_name=" + this.state.metadata.PLANNING_UNIT_NAME + "&feature_class_name=" + feature.feature_class_name + "&alias=" + feature.alias + "&id=" + feature.id, this.wsMessageCallback.bind(this)).then((message) => {
        //websocket has finished
        this.updateFeature(feature, {preprocessed: true, pu_count: Number(message.pu_count), pu_area: Number(message.pu_area), occurs_in_planning_grid: (Number(message.pu_count) >0)});
        resolve(message);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  //calls the marxan executeable and runs it getting the output streamed through websockets
  startMarxanJob(user, project) {
    return new Promise((resolve, reject) => {
      //update the ui to reflect the fact that a job is running
      this.setState({active_pu: undefined});
      //make the request to get the marxan data
      this._ws("runMarxan?user=" + user + "&project=" + project, this.wsMessageCallback.bind(this)).then((message) => {
        resolve(message);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  //gets the results for a project
  getResults(user, project){
    return new Promise((resolve, reject) => {
      this._get("getResults?user=" + user + "&project=" + project).then((response) => {
        this.runCompleted(response);
        resolve("Results retrieved");
      }).catch((error) => {
        reject("Unable to get results");
      });
    });
  }
  
  //run completed
  runCompleted(response) {
    var solutions;
    //get the response and store it in this component
    this.runMarxanResponse = response;
    //if we have some data to map then set the state to reflect this
    if (this.runMarxanResponse.ssoln && this.runMarxanResponse.ssoln.length > 0) {
      this.setSnackBar(response.info);
      //render the sum solution map
      this.renderSolution(this.runMarxanResponse.ssoln, true);
      //create the array of solutions to pass to the InfoPanels table
      solutions = response.summary;
      //the array data are in the format "Run_Number","Score","Cost","Planning_Units" - so create an array of objects to pass to the outputs table
      solutions = solutions.map((item) => {
        return { "Run_Number": item[0], "Score": Number(item[1]).toFixed(1), "Cost": Number(item[2]).toFixed(1), "Planning_Units": item[3], "Missing_Values": item[12] };
      });
      //add in the row for the summed solutions
      solutions.splice(0, 0, { 'Run_Number': 'Sum', 'Score': '', 'Cost': '', 'Planning_Units': '', 'Missing_Values': '' });
      //select the first row in the solutions table
      
      //update the amount of each target that is protected in the current run from the output_mvbest.txt file
      this.updateProtectedAmount(this.runMarxanResponse.mvbest);
    }else{
      solutions = [];
    }
    //set state
    this.runFinished(solutions);
  }

  runFinished(solutions){
    this.setState({ solutions: solutions });
  }
  
  //gets the protected area information in m2 from the marxan run and populates the interest features with the values
  updateProtectedAmount(mvData) {
    //copy the current project features state
    let features = this.state.allFeatures;
    //iterate through the features and set the protected amount
    features.forEach((feature) => {
      //get the matching item in the mvbest data
      let mvbestItemIndex = mvData.findIndex((item) => { return item[0] === feature.id; });
      if (mvbestItemIndex>-1){ //the mvbest file may not contain the data for the feature if the project has not been run since the feature was added
        //get the missing values item for the specific feature
        let mvItem = mvData[mvbestItemIndex];
        Object.assign(feature, {target_area: mvItem[2], protected_area: mvItem[3]});
      }
    });
    //update allFeatures and projectFeatures with the new value
    this.setFeaturesState(features);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////IMPORT PROJECT ROUTINES
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  importProject(project, description, zipFilename, files, planning_grid_name){
    return new Promise((resolve, reject) => {
      let feature_class_name = "", uploadId;
      //start the logging
      this.startLogging();
      //set the spinner and lot states
      this.log({method:'importProject',status:'Importing',info:'Starting import..'});
      //create a new project
      //TODO: SORT OUT ROLLING BACK IF AN IMPORT FAILS - AND DONT PROVIDE REST CALLS TO DELETE PLANNING UNITS
      this.createImportProject(project).then((response) => {
        this.log({method:'importProject',status:'Importing',info:"Project '" + project + "' created"});
        //create the planning unit file
        this.importZippedShapefileAsPu(zipFilename, planning_grid_name, "Imported with the project '" + project + "'").then((response) => {
          //get the planning unit feature_class_name
          feature_class_name = response.feature_class_name;
          //get the uploadid
          uploadId = response.uploadId;
          this.log({method:'importProject',status:'Importing',info:"Planning grid imported"});
          //upload all of the files from the local system
          this.uploadFiles(files, project).then((response) => {
            this.log({method:'importProject',status:'Importing',info:"All files uploaded"});
            //upgrade the project to the new version of Marxan - this adds the necessary settings in the project file and calculates the statistics for species in the puvspr.dat and puts them in the feature_preprocessing.dat file
            this.upgradeProject(project).then((response) => {
              this.log({method:'importProject',status:'Importing',info:"Project updated to new version"});
              //update the project file with the new settings - we also have to set the OUTPUTDIR to the standard 'output' as some imported projects may have set different output folders, e.g. output_BLMBEST
              let d = new Date();
              let formattedDate = ("00" + d.getDate()).slice(-2) + "/" + ("00" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear().toString().slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);
              this.updateProjectParams(project, {DESCRIPTION: description + " (imported from an existing Marxan project)", CREATEDATE: formattedDate, OLDVERSION: 'True', PLANNING_UNIT_NAME: feature_class_name, OUTPUTDIR: 'output'}).then((response) => {
                // wait for the tileset to upload to mapbox
                this.pollMapbox(uploadId).then((response) => {
                  //refresh the planning grids
                  this.getPlanningUnitGrids();
                  this.log({method:'importProject',status:'Finished',info:"Import complete"});
                  //now open the project
                  this.loadProject(project, this.state.user);
                  resolve("Import complete");
                });
              }).catch((error) => { //updateProjectParams error
                  reject(error);
              });
            }).catch((error) => { //upgradeProject error
              reject(error);
            }); 
          }).catch((error) => { //uploadFiles error
              reject(error);
          }); 
        }).catch((error) => { //importZippedShapefileAsPu error - delete the project
          this.deleteProject(this.state.user, project, true);
          reject(error);
        });
      }).catch((error) => { //createImportProject failed - the project already exists
        reject(error);
      });
    });
  }
  
  //uploads a list of files
  async uploadFiles(files, project) {
    var file, filepath;
    for (var i = 0; i < files.length; i++) {
      file = files.item(i);
      //see if it is a marxan data file
      if (file.name.slice(-4) === '.dat'){
        const formData = new FormData();
        formData.append('user', this.state.owner);
        formData.append('project', project);
        //the webkitRelativePath will include the folder itself so we have to remove this, e.g. 'Marxan project/input/puvspr.dat' -> '/input/puvspr.dat'
        filepath = file.webkitRelativePath.split("/").slice(1).join("/");
        formData.append('filename', filepath);
        formData.append('value', file);
        this.log({method:'uploadFiles',status:'Uploading',info:"Uploading: " + file.webkitRelativePath});
        await this.uploadFile(formData);
      }
    }
    return 'All files uploaded';
  }
  
  //uploads a single file
  uploadFile(formData){
    return this._post("uploadFile", formData);
  }
  
  //pads a number with zeros to a specific size, e.g. pad(9,5) => 00009
  pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  //load a specific solution for the current project
  loadSolution(solution) {
    if (solution === "Sum") {
      this.updateProtectedAmount(this.runMarxanResponse.mvbest);
      //load the sum of solutions which will already be loaded
      this.renderSolution(this.runMarxanResponse.ssoln, true);
    }
    else {
      this.getSolution(this.state.owner, this.state.project, solution).then((response) => {
          this.updateProtectedAmount(response.mv);
          this.renderSolution(response.solution, false);
      });
    }
  }

  //gets a solution and returns a promise
  getSolution(user, project, solution){
    return this._get("getSolution?user=" + user + "&project=" + project + "&solution=" + solution);
  }
  
  //gets the total number of planning units in the ssoln and outputs the statistics of the distribution to state, e.g. 2 PUs with a value of 1, 3 with a value of 2 etc.
  getssolncount(data) {
    let total = 0;
    let summaryStats = [];
    data.map((item) => {
      summaryStats.push({ number: item[0], count: item[1].length });
      total += item[1].length;
      return null;
    });
    this.setState({ summaryStats: summaryStats });
    return total;
  }
  //gets a sample of the data to be able to do a classification, e.g. natural breaks, jenks etc.
  getssolnSample(data, sampleSize) {
    let sample = [],
      num = 0;
    let ssolnLength = this.getssolncount(data);
    data.map((item) => {
      //use the ceiling function to force outliers to be in the classification, i.e. those planning units that were only selected in 1 solution
      num = Math.ceil((item[1].length / ssolnLength) * sampleSize);
      sample.push(Array(num, ).fill(item[0]));
      return null;
    });
    return [].concat.apply([], sample);
  }

  //get all data from the ssoln arrays
  getSsolnData(data) {
    let arrays = data.map((item) => {
      return item[1];
    });
    return [].concat.apply([], arrays);
  }
  //gets the classification and colorbrewer object for doing the rendering
  classifyData(data, numClasses, colorCode, classification) {
    //get a sample of the data to make the renderer classification
    let sample = this.getssolnSample(data, 1000); //samples dont work
    // let sample = this.getSsolnData(data); //get all the ssoln data
    //set the data 
    this.state.brew.setSeries(sample);
    //if the colorCode is opacity then calculate the rgba values dynamically and add them to the color schemes
    if (colorCode === 'opacity') {
      //see if we have already created a brew color scheme for opacity with NUMCLASSES
      if ((this.state.brew.colorSchemes.opacity === undefined)  || (this.state.brew.colorSchemes.opacity && !this.state.brew.colorSchemes.opacity[this.state.renderer.NUMCLASSES])) {
        //get a copy of the brew state
        let brewCopy = this.state.brew;
        let newBrewColorScheme = Array(Number(this.state.renderer.NUMCLASSES)).fill("rgba(255,0,136,").map((item, index) => { return item + ((1 / this) * (index + 1)) + ")"; }, this.state.renderer.NUMCLASSES);
        //add the new color scheme
        if (brewCopy.colorSchemes.opacity === undefined) brewCopy.colorSchemes.opacity = [];
        brewCopy.colorSchemes.opacity[this.state.renderer.NUMCLASSES] = newBrewColorScheme;
        //set the state
        this.setState({brew: brewCopy});
      }
    }
    //set the color code - see the color theory section on Joshua Tanners page here https://github.com/tannerjt/classybrew - for all the available colour codes
    this.state.brew.setColorCode(colorCode);
    //get the maximum number of colors in this scheme
    let colorSchemeLength = getMaxNumberOfClasses(this.state.brew, colorCode);
    //check the color scheme supports the passed number of classes
    if (numClasses > colorSchemeLength) {
      //set the numClasses to the max for the color scheme
      numClasses = colorSchemeLength;
      //reset the renderer
      this.setState({ renderer: Object.assign(this.state.renderer, { NUMCLASSES: numClasses }) });
    }
    //set the number of classes
    this.state.brew.setNumClasses(numClasses);
    //set the classification method - one of equal_interval, quantile, std_deviation, jenks (default)
    this.state.brew.classify(classification);
    this.setState({ dataBreaks: this.state.brew.getBreaks()});
  }

  //called when the renderer state has been updated - renders the solution and saves the renderer back to the server
  rendererStateUpdated(parameter, value) {
    this.renderSolution(this.runMarxanResponse.ssoln, true);
    if (this.state.userData.ROLE !== "ReadOnly") this.updateProjectParameter(parameter, value);
  }
  //change the renderer, e.g. jenks, natural_breaks etc.
  changeRenderer(renderer) {
    this.setState({ renderer: Object.assign(this.state.renderer, { CLASSIFICATION: renderer }) }, () => {
      this.rendererStateUpdated("CLASSIFICATION", renderer);
    });
  }
  //change the number of classes of the renderer
  changeNumClasses(numClasses) {
    this.setState({ renderer: Object.assign(this.state.renderer, { NUMCLASSES: numClasses }) }, () => {
      this.rendererStateUpdated("NUMCLASSES", numClasses);
    });
  }
  //change the color code of the renderer
  changeColorCode(colorCode) {
    //set the maximum number of classes that can be selected in the other select boxes
    if (this.state.renderer.NUMCLASSES > this.state.brew.getNumClasses()) {
      this.setState({ renderer: Object.assign(this.state.renderer, { NUMCLASSES: this.state.brew.getNumClasses() }) });
    }
    this.setState({ renderer: Object.assign(this.state.renderer, { COLORCODE: colorCode }) }, () => {
      this.rendererStateUpdated("COLORCODE", colorCode);
    });
  }
  //change how many of the top classes only to show
  changeShowTopClasses(numClasses) {
    this.setState({ renderer: Object.assign(this.state.renderer, { TOPCLASSES: numClasses }) }, () => {
      this.rendererStateUpdated("TOPCLASSES", numClasses);
    });
  }
  //renders the solution - data is the REST response and sum is a flag to indicate if the data is the summed solution (true) or an individual solution (false)
  renderSolution(data, sum) {
    if (!data) return;
    var paintProperties = this.getPaintProperties(data, sum, true);
    //set the render paint property
    this.setState({resultsLayerPaintProperty: paintProperties});
  }

  //gets the various paint properties for the planning unit layer - if setRenderer is true then it will also update the renderer in the Legend panel
  getPaintProperties(data, sum, setRenderer){
    //build an expression to get the matching puids with different numbers of 'numbers' in the marxan results
    var fill_color_expression = this.initialiseFillColorExpression("puid");
    var fill_outline_color_expression = this.initialiseFillColorExpression("puid");
    if (data.length>0) {
      var color, visibleValue, value;
      //create the renderer using Joshua Tanners excellent library classybrew - available here https://github.com/tannerjt/classybrew
      if (setRenderer) this.classifyData(data, Number(this.state.renderer.NUMCLASSES), this.state.renderer.COLORCODE, this.state.renderer.CLASSIFICATION);
      //if only the top n classes will be rendered then get the visible value at the boundary
      if (this.state.renderer.TOPCLASSES < this.state.renderer.NUMCLASSES) {
        let breaks = this.state.brew.getBreaks();
        visibleValue = breaks[this.state.renderer.NUMCLASSES - this.state.renderer.TOPCLASSES + 1];
      }
      else {
        visibleValue = 0;
      }
      // the rest service sends the data grouped by the 'number', e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      data.forEach((row, index) => {
        if (sum) { //multi value rendering
          value = row[0];
          //for each row add the puids and the color to the expression, e.g. [35,36,37],"rgba(255, 0, 136,0.1)"
          color = this.state.brew.getColorInRange(value);
          //add the color to the expression - transparent if the value is less than the visible value
          if (value >= visibleValue) {
            fill_color_expression.push(row[1], color);
            fill_outline_color_expression.push(row[1], "rgba(150, 150, 150, 0.6)"); //gray outline
          }
          else {
            fill_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
            fill_outline_color_expression.push(row[1], "rgba(0, 0, 0, 0)");
          }
        }
        else { //single value rendering
          fill_color_expression.push(row[1], "rgba(255, 0, 136,1)");
          fill_outline_color_expression.push(row[1], "rgba(150, 150, 150, 0.6)"); //gray outline
        }
      });
      // Last value is the default, used where there is no data
      fill_color_expression.push("rgba(0,0,0,0)");
      fill_outline_color_expression.push("rgba(0,0,0,0)");
    }else{
      fill_color_expression = "rgba(0, 0, 0, 0)";
      fill_outline_color_expression = "rgba(0, 0, 0, 0)";
    }
    return {fillColor: fill_color_expression, oulineColor: fill_outline_color_expression};
  }
  
  //initialises the fill color expression for matching on attributes values
  initialiseFillColorExpression(attribute){
    return ["match", ["get", attribute]];
  }
  
  //renders the planning units edit layer according to the type of layer and pu status 
  renderPuEditLayer() {
    let expression;
    if (this.state.planning_units.length > 0) {
      //build an expression to get the matching puids with different statuses in the planning units data
      expression = ["match", ["get", "puid"]];
      // the rest service sends the data grouped by the status, e.g. [1,[23,34,36,43,98]],[2,[16,19]]
      this.state.planning_units.forEach((row, index) => {
        var color;
        //get the status
        switch (row[0]) {
          // case 1: //The PU will be included in the initial reserve system but may or may not be in the final solution.
          //   color = "rgba(63, 191, 63, 1)";
          //   break;
          case 2: //The PU is fixed in the reserve system (“locked in”). It starts in the initial reserve system and cannot be removed.
            color = "rgba(63, 63, 191, 1)";
            break;
          case 3: //The PU is fixed outside the reserve system (“locked out”). It is not included in the initial reserve system and cannot be added.
            color = "rgba(191, 63, 63, 1)";
            break;
          default:
            break;
        }
        //add the color to the expression 
        expression.push(row[1], color);
      });
      // Last value is the default, used where there is no data - i.e. for all the planning units with a status of 0
      expression.push("rgba(150, 150, 150, 0)");
    }
    else {
      //there are no statuses apart from the default 0 status so have a single renderer
      expression = "rgba(150, 150, 150, 0)";
    }
    //set the render paint property
    this.map.setPaintProperty(STATUS_LAYER_NAME, "line-color", expression);
    this.map.setPaintProperty(STATUS_LAYER_NAME, "line-width", STATUS_LAYER_LINE_WIDTH);
  }

  //renders the planning units cost layer according to the cost for each planning unit
  renderPuCostLayer(cost_data) {
    let expression;
    if (cost_data.length > 0) {
      //build an expression to get the matching puids with different costs
      expression = ["match", ["get", "puid"]];
      // the rest service sends the data grouped by the cost, e.g. [2000000,[23,34,36,43,98]],[4744616,[16,19]],[4932674,[21,233]]
      cost_data.forEach((row, index) => {
        var color;
        //get the status
        switch (row[0]) {
          case 2000000: 
            color = "rgba(63, 191, 63, 1)";
            break;
          case 4744616: 
            color = "rgba(63, 63, 191, 1)";
            break;
          case 4932674: 
            color = "rgba(191, 63, 63, 1)";
            break;
          default:
            color = "rgba(191, 63, 63, 0)";
            break;
        }
        //add the color to the expression 
        expression.push(row[1], color);
      });
      // Last value is the default
      expression.push("rgba(150, 150, 150, 0)");
    }
    else {
      //there are no costs apart from the default 0 status so have a single renderer
      expression = "rgba(150, 150, 150, 0.7)";
    }
    //set the render paint property
    this.map.setPaintProperty(COSTS_LAYER_NAME, "fill-color", expression);
    // this.map.setPaintProperty(COSTS_LAYER_NAME, "fill-outline-color", STATUS_LAYER_LINE_WIDTH);
  }

  mouseMove(e) {
    //hide the popup feature list if it is visible
    if (this.state.puFeatures && this.state.puFeatures.length > 0) this.setState({puFeatures:[]});
    //error check
    if (!this.state.userData.SHOWPOPUP) return;
    //get the features under the mouse
    var features = this.map.queryRenderedFeatures(e.point, { layers: [RESULTS_LAYER_NAME, WDPA_LAYER_NAME] });
    //see if there are any features under the mouse
    if (features.length) {
      //set the location for the popup
      if (!this.state.active_pu || (this.state.active_pu && this.state.active_pu.puid !== features[0].properties.puid)) this.setState({ popup_point: e.point });
      //get the properties from the vector tile
      let vector_tile_properties = features[0].properties;
      //get the properties from the marxan results - these will include the number of solutions that that planning unit is found in
      let marxan_results = this.runMarxanResponse && this.runMarxanResponse.ssoln ? this.runMarxanResponse.ssoln.filter(item => item[1].indexOf(vector_tile_properties.puid) > -1)[0] : {};
      if (marxan_results) {
        //convert the marxan results from an array to an object
        let marxan_results_dict = { "puid": vector_tile_properties.puid, "Number": marxan_results[0] };
        //combine the 2 sets of properties
        let active_pu = Object.assign(marxan_results_dict, vector_tile_properties);
        //set the state to re-render the popup
        this.setState({ active_pu: active_pu });
      }
      else {
        this.hidePopup();
      }
    }
    else {
      this.hidePopup();
    }
  }

  hidePopup() {
    this.setState({ active_pu: undefined });
  }

  showProtectedAreasPopup(features, e){
    let paFeatures =[];
    let wdpaIds = [];
    features.forEach((feature) => {
      if (feature.layer.id === WDPA_LAYER_NAME){
        //to get unique protected areas
        if (wdpaIds.indexOf(feature.properties.wdpaid) < 0){
           paFeatures.push(feature.properties);
           wdpaIds.push(feature.properties.wdpaid);
        }
      }
    });  
    this.setState({paFeatures: paFeatures, popup_point: e.point});
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///MAP INSTANTIATION, LAYERS ADDING/REMOVING AND INTERACTION
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //instantiates the mapboxgl map
  createMap(url){
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: url,
      center: [0, 0],
      zoom: 2
    });
    //create the wdpa popup
    this.wdpaPopup = new mapboxgl.Popup({closeButton:false});
    //add event handlers for the load and error events
    this.map.on("load", this.mapLoaded.bind(this));
    this.map.on("error", this.mapError.bind(this));
    this.map.on("click", this.mapClick.bind(this));
    this.map.on('mouseenter', WDPA_LAYER_NAME, this.mouseEnterPA.bind(this));
    this.map.on('mouseleave', WDPA_LAYER_NAME, this.mouseLeavePA.bind(this));
  }
  mouseEnterPA(e) {
    this.map.getCanvas().style.cursor = 'pointer';
    var coordinates = e.lngLat;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    //set the HTML of the protected areas popup
    this.wdpaPopup.setLngLat(coordinates).setLngLat(coordinates)
      .setHTML("<div class='noselect'><a href='https://www.protectedplanet.net/" + e.features[0].properties.wdpaid + "' target='_blank'>" + e.features[0].properties.name + " (" + e.features[0].properties.iucn_cat + ")</a></div>")
      .addTo(this.map);
  }

  mouseLeavePA(e) {
    setTimeout(()=>{
      this.map.getCanvas().style.cursor = '';
      this.wdpaPopup.remove();
    }, 2800);            
  }

  mapLoaded(e) {
    // this.map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right'); // currently full screen hides the info panel and setting position:absolute and z-index: 10000000000 doesnt work properly
    this.map.addControl(new mapboxgl.ScaleControl());
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    //create the draw controls for the map
    this.mapboxDrawControls = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });
    this.map.on("mousemove", this.mouseMove.bind(this));
    this.map.on("moveend", (evt) => {
      if (this.state.clumpingDialogOpen) this.updateMapCentreAndZoom(); //only update the state if the clumping dialog is open
    });
    this.map.on('draw.create', this.polygonDrawn.bind(this));
  }

  updateMapCentreAndZoom(){
    this.setState({mapCentre: this.map.getCenter(), mapZoom: this.map.getZoom()}); 
  }

  //catch all event handler for map errors
  mapError(e){
    var message = "";
    switch (e.error.message) {
      case 'Not Found':
        message = "The tileset '" + e.source.url + "' was not found";
        break;
      case "Bad Request":
        message = "The tileset from source '" + e.sourceId + "' was not found. See <a href='" + ERRORS_PAGE + "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>";
        break;
      default:
        message = e.error.message;
        break;
    }
    if (message!=="http status 200 returned without content."){
      this.setSnackBar("MapError: " + message);
      console.error(message);
    }  
  }
  
  //
  mapClick(e){
    if ((!this.state.puEditing)&&(!this.map.getSource('mapbox-gl-draw-cold'))){ //if the user is not editing planning units or creating a new feature then show what features were in the planning unit for the clicked point
      var features = this.map.queryRenderedFeatures(e.point, { layers: [RESULTS_LAYER_NAME] });
      //set the popup point
      this.setState({ popup_point: e.point });
      //see if there are any planning unit features under the mouse
      if (features.length && features[0].properties.puid) this.getPUFeatureList(features[0].properties.puid);
    }
  }
  
  //gets a list of features for the planning unit
  getPUFeatureList(puid){
    this._get("getPUSpeciesList?user=" + this.state.owner + "&project=" + this.state.project + "&puid=" + puid).then((response) => {
      this.setState({puFeatures: response.data});
    });
  }
  
  //gets all of the metadata for the tileset
  getMetadata(tilesetId) {
    return new Promise((resolve, reject) => {
      fetch("https://api.mapbox.com/v4/" + MAPBOX_USER + "." + tilesetId + ".json?secure&access_token=" + window.MBAT_PUBLIC)
      .then(response => response.json())
      .then((response2) => {
        if ((response2.message != null) && (response2.message.indexOf('does not exist') > 0)){
          reject("The tileset '" + tilesetId + "' was not found. See <a href='" + ERRORS_PAGE + "#the-tileset-from-source-source-was-not-found' target='blank'>here</a>");
        }else{
          resolve(response2);
        }
      });
    });
  }

  //adds the results, planning unit, planning unit edit etc layers to the map
  addPlanningGridLayers(tileset) {
    var beforeLayer = (this.state.basemap === "North Star" ? "" : "");
    //add the source for the planning unit layers
    this.map.addSource(PLANNING_UNIT_SOURCE_NAME,{
        'type': "vector",
        'url': "mapbox://" + tileset.id
      }
    );
    //add the results layer
    this.map.addLayer({
      'id': RESULTS_LAYER_NAME,
      'type': "fill",
      'source': PLANNING_UNIT_SOURCE_NAME,
      'source-layer': tileset.name,
      'paint': {
        'fill-color': "rgba(0, 0, 0, 0)",
        'fill-outline-color': "rgba(0, 0, 0, 0)"
      }
    }, beforeLayer);
    //set the result layer in app state so that it can update the Legend component and its opacity control
    this.setState({resultsLayer: this.map.getLayer(RESULTS_LAYER_NAME)});
    //add the planning unit layer 
    this.map.addLayer({
      'id': PU_LAYER_NAME,
      'type': "fill",
      'source': PLANNING_UNIT_SOURCE_NAME,
      "layout": {
        "visibility": "none"
      },
      'source-layer': tileset.name,
      'paint': {
        'fill-color': "rgba(0, 0, 0, 0)",
        'fill-outline-color': "rgba(150, 150, 150, " + PU_LAYER_OPACITY + ")"
      }
    }, beforeLayer);
    //add the planning units manual edit layer - this layer shows which individual planning units have had their status changed
    this.map.addLayer({
      'id': STATUS_LAYER_NAME,
      'type': "line",
      'source': PLANNING_UNIT_SOURCE_NAME,
      "layout": {
        "visibility": "none"
      },
      'source-layer': tileset.name,
      'paint': {
        'line-color': "rgba(150, 150, 150, 0)",
        'line-width': STATUS_LAYER_LINE_WIDTH
      }
    }, beforeLayer);
    //add the planning units costs layer
    this.map.addLayer({
      'id': COSTS_LAYER_NAME,
      'type': "fill",
      'source': PLANNING_UNIT_SOURCE_NAME,
      "layout": {
        "visibility": "none"
      },
      'source-layer': tileset.name,
      'paint': {
        'fill-color': "rgba(255, 0, 0, 0)",
        'fill-outline-color': "rgba(150, 150, 150, 0)"
      }
    }, beforeLayer);
    //add the puvspr planning unit layer - this layer shows the planning unit distribution of a feature from the puvspr file
    this.map.addLayer({
      'id': PUVSPR_LAYER_NAME,
      'type': "line",
      'source': PLANNING_UNIT_SOURCE_NAME,
      "layout": {
        "visibility": "none"
      },
      'source-layer': tileset.name,
      'paint': {
        'line-color': "rgba(255, 255, 255, 1)",
        'line-width': PUVSPR_LAYER_LINE_WIDTH
      }
    }, beforeLayer);
  }

  removePlanningGridLayers() {
    let layers = this.map.getStyle().layers;
    //get the dynamically added layers
    let dynamicLayers = layers.filter((item) => {
      return (item.source === PLANNING_UNIT_SOURCE_NAME);
    });
    //remove them from the map
    dynamicLayers.forEach((item) => {
      this.map.removeLayer(item.id);
    });
    //remove the sources if present
    if (this.map.getSource(PLANNING_UNIT_SOURCE_NAME) !== undefined) this.map.removeSource(PLANNING_UNIT_SOURCE_NAME);
  }
  
  //adds the WDPA vector tile layer source - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPASource(){
    //add the source for the wdpa
    let yr = this.state.marxanServer.wdpa_version.substr(-4); //get the year from the wdpa_version
    let attribution = "IUCN and UNEP-WCMC (" + yr + "), The World Database on Protected Areas (WDPA) " + this.state.marxanServer.wdpa_version + ", Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>";
    let tiles = [window.WDPA.tilesUrl + "layer=marxan:" + this.wdpa_vector_tile_layer + "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"];
    this.setState({wdpaAttribution: attribution});
    this.map.addSource(WDPA_SOURCE_NAME,{
        "attribution": attribution,
        "type": "vector",
        "tiles": tiles 
      }
    ); 
  }
  
  //adds the WDPA vector tile layer - this is a separate function so that if the source vector tiles are updated, the layer can be re-added on its own
  addWDPALayer(){
    this.map.addLayer({
      "id": WDPA_LAYER_NAME,
      "type": "fill",
      "source": WDPA_SOURCE_NAME,
      "source-layer": this.wdpa_vector_tile_layer,
      "layout": {
        "visibility": "visible"
      },
      "filter": ["==", "wdpaid", -1],
      "paint": {
        "fill-color": {
          "type": "categorical",
          "property": "marine",
          "stops": [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"]
          ]
        },
        "fill-outline-color": {
          "type": "categorical",
          "property": "marine",
          "stops": [
            ["0", "rgb(99,148,69)"],
            ["1", "rgb(63,127,191)"],
            ["2", "rgb(63,127,191)"]
          ]
        },
        "fill-opacity": this.state.wdpa_layer_opacity
      }
    });
    //set the wdpa layer in app state so that it can update the Legend component and its opacity control
    this.setState({wdpaLayer: this.map.getLayer(WDPA_LAYER_NAME)});
  }
  
  showLayer(id) {
    if (this.map&&this.map.getLayer(id)) this.map.setLayoutProperty(id, 'visibility', 'visible');
  }
  hideLayer(id) {
    if (this.map&&this.map.getLayer(id)) this.map.setLayoutProperty(id, 'visibility', 'none');
  }

  isLayerVisible(layername){
    return (this.map && this.map.getLayer(layername) && this.map.getLayoutProperty(layername, 'visibility') === 'visible');
  }
  
  //changes the layers opacity
  changeOpacity(layerId, opacity){
    if (this.map && this.map.getLayer(layerId)){
      this.map.setPaintProperty(layerId, 'fill-opacity', opacity);
      //set the state
      if (layerId === RESULTS_LAYER_NAME) this.setState({results_layer_opacity: opacity});
      if (layerId === WDPA_LAYER_NAME) this.setState({wdpa_layer_opacity: opacity});
    }
  }

  //zooms to the extent of the project, i.e. the tileset bounds for the planning grid
  zoomToProjectBounds(){
    if (this.state.tileset && this.state.tileset.bounds) this.zoomToBounds(this.map, this.state.tileset.bounds);
  }
  
  //zooms the passed map to the passed bounds
  zoomToBounds(_map, bounds) {
    let minLng = (bounds[0] < -180) ? -180 : bounds[0];
    let minLat = (bounds[1] < -90) ? -90 : bounds[1];
    let maxLng = (bounds[2] > 180) ? 180 : bounds[2];
    let maxLat = (bounds[3] > 90) ? 90 : bounds[3];
    _map.fitBounds([minLng, minLat, maxLng, maxLat], { padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1; } });
  }

  toggleCosts(show){
    //show/hide the planning units cost layer 
    if (show){
      this.getPlanningUnitsCostData().then((cost_data)=>{
        this.renderPuCostLayer(cost_data);
        this.showLayer(COSTS_LAYER_NAME);
      })
    }else{
      this.hideLayer(COSTS_LAYER_NAME);
    }
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///ACTIVATION/DEACTIVATION OF TABS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //fired when the projects tab is selected
  project_tab_active() {
    this.setState({ activeTab: "project" });
    this.pu_tab_inactive();
  }

  //fired when the features tab is selected
  features_tab_active() {
    if (this.state.activeTab !== "features"){
      this.setState({ activeTab: "features" });
      //render the sum solution map
      // this.renderSolution(this.runMarxanResponse.ssoln, true);
      //hide the planning unit layers
      this.pu_tab_inactive();
    }
  }

  //fired when the planning unit tab is selected
  pu_tab_active() {
    this.setState({ activeTab: "planning_units" });
    //set a flag to capture if the outlined planning units layer needs to be reshown when switching back to any other tab
    this.reinstatePuvsprLayer = this.isLayerVisible(PUVSPR_LAYER_NAME);
    //hide the outlined planning units layer
    this.hideLayer(PUVSPR_LAYER_NAME);
    //show the planning units layer 
    this.showLayer(PU_LAYER_NAME);
    //hide the results layer
    this.changeOpacity(RESULTS_LAYER_NAME, RESULTS_LAYER_FILL_OPACITY_INACTIVE);
    //store the values for the result layers opacities
    this.previousResultsOpacity = this.state.results_layer_opacity;
    //show the planning units status layer 
    this.showLayer(STATUS_LAYER_NAME);
    //render the planning units status layer_edit layer
    this.renderPuEditLayer(STATUS_LAYER_NAME);
  }

  //fired whenever another tab is selected
  pu_tab_inactive() {
    //reinstate the outlined planning units layer if needs be
    if (this.reinstatePuvsprLayer) this.showLayer(PUVSPR_LAYER_NAME);
    //change the opacity on the results layer to back to what it was
    this.changeOpacity(RESULTS_LAYER_NAME, (this.previousResultsOpacity) ? this.previousResultsOpacity : RESULTS_LAYER_FILL_OPACITY_ACTIVE);
    //hide the planning units layer 
    this.hideLayer(PU_LAYER_NAME);
    //hide the planning units edit layer 
    this.hideLayer(STATUS_LAYER_NAME);
  }

  //fired when the legend tab is selected
  legend_tab_active() {
    this.setState({activeResultsTab: "legend" });
  }

  //fired when the solutions tab is selected
  solutions_tab_active() {
    this.setState({activeResultsTab: "solutions" });
  }

  //fired when the log tab is selected
  log_tab_active() {
    this.setState({activeResultsTab: "log" });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///PLANNING UNIT WORKFLOW AND FUNCTIONS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  startPuEditSession() {
    //set the state
    this.setState({puEditing: true});
    //set the cursor to a crosshair
    this.map.getCanvas().style.cursor = "crosshair";
    //add the left mouse click event to the planning unit layer
    this.onClickRef = this.moveStatusUp.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("click", PU_LAYER_NAME, this.onClickRef); 
    //add the mouse right click event to the planning unit layer 
    this.onContextMenu = this.resetStatus.bind(this); //using bind creates a new function instance so we need to get a reference to that to be able to remove it later
    this.map.on("contextmenu", PU_LAYER_NAME, this.onContextMenu); 
  }

  stopPuEditSession() {
    //set the state
    this.setState({puEditing: false});
    //reset the cursor
    this.map.getCanvas().style.cursor = "pointer";
    //remove the mouse left click event
    this.map.off("click", PU_LAYER_NAME, this.onClickRef);
    //remove the mouse right click event
    this.map.off("contextmenu", PU_LAYER_NAME, this.onContextMenu);
    //update the pu.dat file
    this.updatePuDatFile();
  }

  //clears all of the manual edits from the pu edit layer (except the protected area units)
  clearManualEdits(){
    //clear all the planning unit statuses
      this.setState({ planning_units: [] }, () => {
        //get the puids for the current iucn category
        let puids = this.getPuidsFromIucnCategory(this.state.metadata.IUCN_CATEGORY);
        //update the planning units
        this.updatePlanningUnits([], puids);
      });
  }
  
  //sends a list of puids that should be excluded from the run to upddate the pu.dat file
  updatePuDatFile() {
    //initialise the form data
    let formData = new FormData();
    //add the current user
    formData.append("user", this.state.owner);
    //add the current project
    formData.append("project", this.state.project);
    //add the planning unit manual exceptions
    if (this.state.planning_units.length > 0) {
      this.state.planning_units.forEach((item) => {
        //get the name of the status parameter
        let param_name = "status" + item[0];
        //add the planning units
        formData.append(param_name, item[1]);
      });
    }
    //post to the server
    this._post("updatePUFile", formData).then((response) => {
      //do something
    });
  }

  //fired when the user left clicks on a planning unit to move its status up
  moveStatusUp(e) {
    this.changeStatus(e, "up");
  }

  //fired when the user left clicks on a planning unit to reset its status 
  resetStatus(e) {
    this.changeStatus(e, "reset");
  }

  changeStatus(e, direction) {
    //get the feature that the user has clicked 
    var features = this.map.queryRenderedFeatures(e.point, { layers: [PU_LAYER_NAME] });
    //get the featureid
    if (features.length > 0) {
      //get the puid
      let puid = features[0].properties.puid;
      //get its current status 
      let status = this.getStatusLevel(puid);
      //get the next status level
      let next_status = this.getNextStatusLevel(status, direction);
      //copy the current planning unit statuses 
      let statuses = this.state.planning_units;
      //if the planning unit is not at level 0 (in which case it will not be in the planning_units state) - then remove it from the puids array for that status
      if (status !== 0) this.removePuidFromArray(statuses, status, puid);
      //add it to the new status array
      if (next_status !== 0) this.addPuidToArray(statuses, next_status, puid);
      //set the state
      this.setState({ planning_units: statuses });
      //re-render the planning unit edit layer
      this.renderPuEditLayer();
    }
  }

  getStatusLevel(puid) {
    //iterate through the planning unit statuses to see which status the clicked planning unit belongs to, i.e. 1, 2 or 3
    let status_level = 0; //default level as the getPlanningUnits REST call only returns the planning units with non-default values
    PLANNING_UNIT_STATUSES.forEach((item) => {
      let planning_units = this.getPlanningUnitsByStatus(item);
      if (planning_units.indexOf(puid) > -1) {
        status_level = item;
      }
    });
    return status_level;
  }

  //gets the array index position for the passed status in the planning_units state
  getStatusPosition(status) {
    let position = -1;
    this.state.planning_units.forEach((item, index) => {
      if (item[0] === status) position = index;
    });
    return position;
  }

  //returns the planning units with a particular status, e.g. 1,2,3 
  getPlanningUnitsByStatus(status) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    //get the array of planning units
    let returnValue = (position > -1) ? this.state.planning_units[position][1] : [];
    return returnValue;
  }
  
  //returns the next status level for a planning unit depending on the direction
  getNextStatusLevel(status, direction) {
    let nextStatus;
    switch (status) {
      case 0:
        nextStatus = (direction === "up") ? 3 : 0;
        break;
      case 1: //no longer used
        nextStatus = (direction === "up") ? 0 : 0;
        break;
      case 2:
        nextStatus = (direction === "up") ? 0 : 0; //used to be 1 going down
        break;
      case 3:
        nextStatus = (direction === "up") ? 2 : 0;
        break;
      default:
        break;
    }
    return nextStatus;
  }

  //removes in individual puid value from an array of puid statuses 
  removePuidFromArray(statuses, status, puid) {
    return this.removePuidsFromArray(statuses, status, [puid]);
  }

  addPuidToArray(statuses, status, puid) {
    return this.appPuidsToPlanningUnits(statuses, status, [puid]);
  }

  //adds all the passed puids to the planning_units state
  appPuidsToPlanningUnits(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units, i.e. the index
    let position = this.getStatusPosition(status);
    if (position === -1) {
      //create a new status and empty puid array
      statuses.push([status, []]);
      position = statuses.length - 1;
    }
    //add the puids to the puid array ensuring that they are unique
    statuses[position][1] = Array.from(new Set(statuses[position][1].concat(puids)));
    return statuses;
  }

  //removes all the passed puids from the planning_units state
  removePuidsFromArray(statuses, status, puids) {
    //get the position of the status items in the this.state.planning_units
    let position = this.getStatusPosition(status);
    if (position > -1) {
      let puid_array = statuses[position][1];
      let new_array = puid_array.filter((item) => {
        return puids.indexOf(item) < 0;
      }); 
      statuses[position][1] = new_array;
      //if there are no more items in the puid array then remove it
      if (new_array.length === 0) statuses.splice(position, 1);
    }
    return statuses;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //ROUTINES FOR WORKING WITH COSTS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  getPlanningUnitsCostData(){
    return new Promise((resolve, reject) => {
      this._get("getPlanningUnitsCostData?user=" + this.state.owner + "&project=" + this.state.project).then((response) => {
        resolve(response.data);
      }).catch((error) => {
        //do something
      });
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //ROUTINES FOR CREATING A NEW PROJECT AND PLANNING UNIT GRIDS
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //previews the planning grid
  previewPlanningGrid(planning_grid_metadata){
    this.setState({planning_grid_metadata:planning_grid_metadata});
    this.openPlanningGridDialog();
  }
  
  //creates a new planning grid unit 
  createNewPlanningUnitGrid(iso3, domain, areakm2, shape) {
    return new Promise((resolve, reject) => {
      this.startLogging();
      this._ws("createPlanningUnitGrid?iso3=" + iso3 + "&domain=" + domain + "&areakm2=" + areakm2 + "&shape=" + shape, this.wsMessageCallback.bind(this)).then((message) => {
        this.newPlanningGridCreated(message).then(()=>{
          this.closeNewPlanningGridDialog();
          //websocket has finished 
          resolve(message);
        });
      }).catch((error) => {
        //do something
        reject(error);
      });
    });
  }

  //imports a zipped shapefile as a new planning grid
  importPlanningUnitGrid(zipFilename, alias, description){
    return new Promise((resolve, reject) => {
      this.startLogging();
      this.log({method:'importPlanningUnitGrid',status:'Started',info:"Importing planning grid.."});
      this.importZippedShapefileAsPu(zipFilename, alias, description).then((response) => {
        this.log({method:'importPlanningUnitGrid',status:'Finished',info: response.info});
        this.newPlanningGridCreated(response).then(()=> {
          this.closeImportPlanningGridDialog();
        });
      }).catch((error) => { //importZippedShapefileAsPu error
        this.deletePlanningUnitGrid(alias, true);
        this.log({method:'importPlanningUnitGrid',status:'Finished',error:error});
        reject(error);
      });
    });
  }
  
  //called when a new planning grid has been created
  newPlanningGridCreated(response){
    return new Promise((resolve, reject) => {
      //start polling to see when the upload is done
      this.pollMapbox(response.uploadId).then(() => {
        //update the planning unit items
        this.getPlanningUnitGrids();
        resolve("Planning grid created");
      });
    });
  }

  //deletes a planning unit grid
  deletePlanningUnitGrid(feature_class_name, silent = false){
    if (silent){ //used to roll back failed imports of planning grids
      this.deletePlanningGrid(feature_class_name, true);
    }else{
      //get a list of the projects for the planning grid
      this._get("listProjectsForPlanningGrid?feature_class_name=" + feature_class_name).then((response)=>{
        //if the planning grid is not being used then delete it
        if (response.projects.length === 0){
          this.deletePlanningGrid(feature_class_name, false);
        }else{
          //show the failed to delete dialog
          this.setState({failedToDeleteProjects: response.projects, deleteWhat: 'planning grid'}, ()=> {
            this.openFailedToDeleteDialog();
          });
        }
      });
    }
  }
  
  //deletes a planning grid
  deletePlanningGrid(feature_class_name, silent){
      this._get("deletePlanningUnitGrid?planning_grid_name=" + feature_class_name).then((response) => {
        //update the planning unit grids
        this.getPlanningUnitGrids();
        this.setSnackBar(response.info, silent);  
      }).catch((error) => {
        //additional stuff
      });
  }
  
  getCountries() {
    this._get("getCountries").then((response) => {
      this.setState({ countries: response.records });
    });
  }

  //uploads the named feature class to mapbox on the server
  uploadToMapBox(feature_class_name, mapbox_layer_name) {
    return new Promise((resolve, reject) => {
      this._get("uploadTilesetToMapBox?feature_class_name=" + feature_class_name + "&mapbox_layer_name=" + mapbox_layer_name, 300000).then((response) => {
        this.setState({loading: true});
        //poll mapbox to see when the upload has finished
        this.pollMapbox(response.uploadid).then((response2) => {
          resolve("Uploaded to Mapbox");
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  //polls mapbox to see when an upload has finished - returns as promise
  pollMapbox(uploadid){
    this.setState({loading: true});
    this.log({info: 'Uploading to Mapbox..',status:'Uploading'});
    return new Promise((resolve, reject) => {
      this.timer = setInterval(() => {
        fetch("https://api.mapbox.com/uploads/v1/" + MAPBOX_USER + "/" + uploadid + "?access_token=" + window.MBAT)
          .then(response => response.json())
          .then((response) => {
            if (response.complete){
              this.log({info: 'Uploaded',status:'UploadComplete'});
              //clear the timer
              clearInterval(this.timer);
              this.timer = null;
              //reset state
              this.setState({loading: false });
              resolve("Uploaded to Mapbox");
            }
          })
          .catch((error) => {
            this.setState({loading: false });
            reject(error);
          });
      }, 3000);
    });
  }
  
  openFeaturesDialog(showClearSelectAll) {
    this.setState({ featuresDialogOpen: true, addingRemovingFeatures: showClearSelectAll});
    if (showClearSelectAll) this.getSelectedFeatureIds();
  }
  closeFeaturesDialog() {
    this.setState({ featuresDialogOpen: false, featuresDialogPopupOpen: false });
  }
  openNewFeatureDialog(){
    this.setState({ NewFeatureDialogOpen: true });
  }
  closeNewFeatureDialog() {
    this.setState({ NewFeatureDialogOpen: false });
    //finalise digitising 
    this.finaliseDigitising();
  }
  openImportFeaturesDialog() {
    this.setState({ importFeaturesDialogOpen: true});
  }
  closeImportFeaturesDialog() {
    this.setState({ importFeaturesDialogOpen: false});
  }
  openPlanningGridsDialog(){
    this.setState({planningGridsDialogOpen: true});
  }
  closePlanningGridsDialog(){
    this.setState({planningGridsDialogOpen: false});
  }
  openPlanningGridDialog(){
    this.setState({planningGridDialogOpen: true});
  }
  closePlanningGridDialog(){
    this.setState({planningGridDialogOpen: false});
  }
  openFeatureDialog(){
    this.setState({featureDialogOpen: true});
  }
  closeFeatureDialog(){
    this.setState({featureDialogOpen: false});
  }
  showNewFeaturesDialogPopover(){
    this.setState({ featuresDialogPopupOpen: true });
  }
  closePopover(){
    this.setState({ featuresDialogPopupOpen: false });
  }
  openCostsDialog() {
    this.setState({ CostsDialogOpen: true });
  }
  closeCostsDialog() {
    this.setState({ CostsDialogOpen: false });
  }
  setNewFeatureDatasetFilename(filename) {
    this.setState({ featureDatasetFilename: filename });
  }
  //used by the import wizard to import a users zipped shapefile as the planning units
  importZippedShapefileAsPu(zipname, alias, description) {
    //the zipped shapefile has been uploaded to the MARXAN folder - it will be imported to PostGIS and a record will be entered in the metadata_planning_units table
    return this._get("importPlanningUnitGrid?filename=" + zipname + "&name=" + alias + "&description=" + description);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // MANAGING INTEREST FEATURES SECTION
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //updates the properties of a feature and then updates the features state
  updateFeature(feature, newProps){
    let features = this.state.allFeatures;
    //get the position of the feature 
    var index = features.findIndex((element) => { return element.id === feature.id; });
    if (index!==-1) {
      Object.assign(features[index], newProps);
      //update allFeatures and projectFeatures with the new value
      this.setFeaturesState(features);
    }
  }

  //gets the ids of the selected features
  getSelectedFeatureIds(){
    let ids = [];
    this.state.allFeatures.forEach((feature) => {
      if (feature.selected) ids.push(feature.id);
    });
    this.setState({selectedFeatureIds: ids});
  }

  //when a user clicks a feature in the FeaturesDialog
  clickFeature(feature){
    let ids = this.state.selectedFeatureIds;
    if (ids.includes(feature.id)){
      //remove the feature if it is already selected
      this.removeFeature(feature);
    }else{
      //add the feature to the selected feature array
      this.addFeature(feature);
    }
  }
  
  //removes a feature from the selectedFeatureIds array
  removeFeature(feature){
    let ids = this.state.selectedFeatureIds;
    //remove the feature  - this requires a callback on setState otherwise the state is not updated before updateSelectedFeatures is called
    ids = ids.filter((value, index, arr) => {return value !== feature.id});
    return new Promise((resolve, reject) => {
      this.setState({ selectedFeatureIds: ids }, () => {
        resolve("Feature removed");  
      });
    });
  }
  
  //adds a feature to the selectedFeatureIds array
  addFeature(feature){
    let ids = this.state.selectedFeatureIds;
    //add the feautre to the selected feature array
    ids.push(feature.id);
    this.setState({ selectedFeatureIds: ids });
  }
  
  //starts a digitising session
  initialiseDigitising(){
    //show the digitising controls if they are not already present, mapbox-gl-draw-cold and mapbox-gl-draw-hot
    if (!this.map.getSource('mapbox-gl-draw-cold')) this.map.addControl(this.mapboxDrawControls);
  }
  
  //finalises the digitising
  finaliseDigitising(){
    //hide the drawing controls
    this.map.removeControl(this.mapboxDrawControls);
  }
  //called when the user has drawn a polygon on screen
  polygonDrawn(evt){
    //open the new feature dialog for the metadata
    this.openNewFeatureDialog();
    //save the feature in a local variable
    this.digitisedFeatures = evt.features;
  }
  
  //selects all the features
  selectAllFeatures() {
    let ids = [];
    this.state.allFeatures.forEach((feature) => {
      ids.push(feature.id);
    });
    this.selectFeatures(ids);
  }

  //clears all the Conservation features
  clearAllFeatures() {
    this.setState({selectedFeatureIds: []});
  }

  //selects features 
  selectFeatures(ids) {
    this.setState({selectedFeatureIds: ids});
  }

  //updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog
  updateSelectedFeatures(){
    let allFeatures = this.state.allFeatures;
    allFeatures.forEach((feature) => {
      if (this.state.selectedFeatureIds.includes(feature.id)) {
        Object.assign(feature, {selected: true});
      }else{
        if (this.state.metadata.OLDVERSION){
          //for imported projects we cannot preprocess them any longer as we dont have access to the features spatial data - therefore dont set preprocessed to false or any of the other stats fields
          Object.assign(feature, {selected: false});
        }else{
          Object.assign(feature, {selected: false, preprocessed: false, protected_area: -1, pu_area: -1, pu_count: -1, target_area: -1, occurs_in_planning_grid: false});
        }
        //remove the feature layer if it is loaded
        if (feature.feature_layer_loaded) this.toggleFeatureLayer(feature);
        //remove the planning unit layer if it is loaded
        if (feature.id === this.puvsprLayerId) this.toggleFeaturePuvsprLayer(feature);
      }
    });
    //when the project features have been saved to state, update the spec.dat file
    this.setFeaturesState(allFeatures, ()=>{
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile(); 
      //close the dialog
      this.closeFeaturesDialog();
    });
  }

  //updates the target values for all features in the project to the passed value
  updateTargetValueForFeatures(target_value){
    let allFeatures = this.state.allFeatures;
    //iterate through all features
    allFeatures.forEach((feature) => {
      Object.assign(feature, {target_value: target_value});
    });
    //set the features in app state
    this.setFeaturesState(allFeatures, ()=> {
      //persist the changes to the server
      if (this.state.userData.ROLE !== "ReadOnly") this.updateSpecFile(); 
    });
  }
  
  //the callback is optional and will be called when the state has updated
  setFeaturesState(newFeatures, callback){
    //update allFeatures and projectFeatures with the new value
    this.setState({ allFeatures: newFeatures, projectFeatures: newFeatures.filter((item) => { return item.selected }) }, callback);
  }
  
  //unselects a single Conservation feature
  unselectItem(feature) {
    //remove it from the selectedFeatureIds array
    this.removeFeature(feature).then(() => {
      //refresh the selected features
      this.updateSelectedFeatures();
    });
  }

  //previews the feature
  previewFeature(feature_metadata){
    this.setState({feature_metadata:feature_metadata});
    this.openFeatureDialog();
  }

  //unzips a shapefile on the server
  unzipShapefile(filename){
    return new Promise((resolve, reject) => {
      this._get("unzipShapefile?filename=" + filename).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });    
  }
  
  //deletes a zip file and shapefile (with the *.shp extension) 
  deleteShapefile(zipfile, shapefile){
    return new Promise((resolve, reject) => {
      this._get("deleteShapefile?zipfile=" + zipfile + "&shapefile=" + shapefile).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });    
  }
  
  //gets a list of fieldnames from the passed shapefile - this must exist in the servers root directory
  getShapefileFieldnames(filename){
    return new Promise((resolve, reject) => {
      this._get("getShapefileFieldnames?filename=" + filename).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });    
  }
  
  //create new features from the already uploaded zipped shapefile 
  importFeatures(zipfile, name, description, shapefile,  spiltfield){
    //start the logging
    this.startLogging();
    return new Promise((resolve, reject) => {
      //get the request url
      let url = (name !== "") ? "importFeatures?zipfile=" + zipfile + "&shapefile=" + shapefile + "&name=" + name + "&description=" + description : "importFeatures?zipfile=" + zipfile + "&shapefile=" + shapefile + "&splitfield=" + spiltfield;
      this._ws(url, this.wsMessageCallback.bind(this)).then((message) => {
        //websocket has finished 
        resolve(message);
      }).catch((error) => {
        reject(error);
      });
    }); //return
  }

  //create the new feature from the feature that has been digitised on the map
  createNewFeature(name, description){
    //start the logging
    this.startLogging();
    this.log({method:'createNewFeature',status:'Started',info:"Creating feature.."});
    //post the geometry to the server with the metadata
    let formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    //convert the coordinates into a linestring to create the polygon in postgis
    let coords = this.digitisedFeatures[0].geometry.coordinates[0].map((coordinate) => {
      return coordinate[0] + " " + coordinate[1];
    }).join(",");
    formData.append('linestring', "Linestring(" + coords + ")");
    this._post("createFeatureFromLinestring", formData).then((response) => {
        this.log({method:'createNewFeature',status:'Finished', info: response.info});
        //start polling to see when the upload is done
        this.pollMapbox(response.uploadId).then(() => {
          this.newFeatureCreated(response.id);
          //close the dialog
          this.closeNewFeatureDialog();
        });
    }).catch((error) => {
      this.log({status:'Finished', error: error});
    });
  }
  
  //gets the new feature information and updates the state
  newFeatureCreated(id){
    this.getInterestFeature(id);
  }
  
  getInterestFeature(id) {
    //load the interest feature from the marxan web database
    this._get("getFeature?oid=" + id + "&format=json").then((response) => {
      //add the required attributes to use it in Marxan Web
      this.addFeatureAttributes(response.data[0]);
      //update the allFeatures array
      this.addNewFeature(response.data[0]);
    });
  }

  //adds a new feature to the allFeatures array
  addNewFeature(feature){
    //update the allFeatures array
    var featuresCopy = this.state.allFeatures;
    featuresCopy.push(feature);
    this.setState({allFeatures: featuresCopy});
  }
  
  //attempts to delete a feature - if the feature is in use in a project then it will not be deleted and the list of projects will be shown
  deleteFeature(feature) {
    this._get("listProjectsForFeature?feature_class_id=" + feature.id).then((response) => {
      if (response.projects.length === 0){
        this._deleteFeature(feature);
      }else{
        this.setState({failedToDeleteProjects: response.projects, deleteWhat: 'feature'}, ()=> {
          this.openFailedToDeleteDialog();
        });
      }
    });
  }

  //deletes a feature
  _deleteFeature(feature){
    this._get("deleteFeature?feature_name=" + feature.feature_class_name).then((response) => {
      this.setSnackBar("Feature deleted");
      //remove it from the current project if necessary
      this.removeFeature(feature);
      //remove it from the allFeatures array
      this.removeFeatureFromAllFeatures(feature);
    });
  }

  //shows the failed to delete feature dialog
  showFailedToDeleteDialog(feature, projects){
    console.log(projects)  ;
  }
  
  //removes a feature from the allFeatures array
  removeFeatureFromAllFeatures(feature){
    let featuresCopy = this.state.allFeatures;
    //remove the feature 
    featuresCopy = featuresCopy.filter((item) => {return item.id !== feature.id});
    //update the allFeatures state   
    this.setState({allFeatures: featuresCopy});
  }
  
  //gets all the features 
  getAllFeatures(){
    return new Promise((resolve, reject) => {
      this._get("getAllSpeciesData").then((response) => {
        //set the allfeatures state
        this.setState({allFeatures: response.data});
        resolve("Features returned");
      }).catch((error) => {
        //do something
      });
    });
  }

  openFeatureMenu(evt, feature){
    //set the menu text
    let puvsprLayerText = this.getMenuTextForPuvsprLayer(feature);
    this.setState({featureMenuOpen: true, currentFeature: feature, menuAnchor: evt.currentTarget, puvsprLayerText: puvsprLayerText});
  }
  closeFeatureMenu(evt){
    this.setState({featureMenuOpen: false});
  }

  //get feature menu text for puvspr layer
  getMenuTextForPuvsprLayer(feature){
    //see if the layer that shows the planning units for a feature is currently visible on the map
    let visible = this.isLayerVisible(PUVSPR_LAYER_NAME);
    //see if the feature layer is different from the one that is already being shown on the map
    let newFeature = ((feature.id !== this.puvsprLayerId) || (this.puvsprLayerId === undefined));
    //really confusing line!
    let puvsprLayerText = (visible) ? (newFeature) ? (feature.preprocessed) ? SHOW_PUVSPR_LAYER_TEXT : HIDE_PUVSPR_LAYER_TEXT : (feature.preprocessed) ? HIDE_PUVSPR_LAYER_TEXT : SHOW_PUVSPR_LAYER_TEXT : SHOW_PUVSPR_LAYER_TEXT;
    return puvsprLayerText;
  }
  
  //hides the feature layer
  hideFeatureLayer(){
    this.state.projectFeatures.forEach((feature) => {
      if (feature.feature_layer_loaded) this.toggleFeatureLayer(feature);
    });
  }
  
  //toggles the feature layer on the map
  toggleFeatureLayer(feature){
    // this.closeFeatureMenu();
    let layerName = feature.tilesetid.split(".")[1];
    if (this.map.getLayer(layerName)){
      this.map.removeLayer(layerName);
      this.map.removeSource(layerName);
      this.updateFeature(feature, {feature_layer_loaded: false});
    }else{
      this.map.addLayer({
        'id': layerName,
        'type': "fill",
        'source': {
          'type': "vector",
          'url': "mapbox://" + feature.tilesetid
        },
        'source-layer': layerName,
        'paint': {
          'fill-color': "rgba(255, 0, 0, 1)",
          'fill-outline-color': "rgba(255, 0, 0, 1)"
        }
      }, PUVSPR_LAYER_NAME); //add it before the layer that shows the planning unit outlines for the feature
      this.updateFeature(feature, {feature_layer_loaded: true});
    }
  }
  
  toggleFeaturePuvsprLayer(feature){
    // this.closeFeatureMenu();
    if (this.state.puvsprLayerText === HIDE_PUVSPR_LAYER_TEXT){
      this.hideLayer(PUVSPR_LAYER_NAME);
      //set the text
      this.setState({puvsprLayerText: SHOW_PUVSPR_LAYER_TEXT});
      //reset the id of the currently shown pu layer
      this.puvsprLayerId = -1;
    }else{
      //set the text
      this.setState({puvsprLayerText: HIDE_PUVSPR_LAYER_TEXT});
      //get the planning units where the feature occurs from the puvspr.dat file
      this.getFeaturePlanningUnits(feature.id);
    }
  }

  //get the planning unit ids where the feature occurs
  getFeaturePlanningUnits(oid){
    this._get("getFeaturePlanningUnits?user=" + this.state.owner + "&project=" + this.state.project + "&oid=" + oid).then((response) => {
      //update the paint property for the layer
      var line_color_expression = this.initialiseFillColorExpression("puid");
      response.data.forEach((puid) => {
          line_color_expression.push(puid, PUVSPR_LAYER_OUTLINE_COLOR); 
      });
      // Last value is the default, used where there is no data
      line_color_expression.push("rgba(0,0,0,0)");
      this.map.setPaintProperty(PUVSPR_LAYER_NAME, "line-color", line_color_expression);
      //show the layer
      this.showLayer(PUVSPR_LAYER_NAME);
      //set the puvsprLayerId value - this is used to see which puvspr layer is currently being shown on the map to be able to set the text for the menu item
      this.puvsprLayerId = oid;
    });
  }

  //removes the current feature from the project
  removeFromProject(feature){
    this.closeFeatureMenu();
    this.unselectItem(feature);
  }
  
  //zooms to a features extent
  zoomToFeature(feature){
    this.closeFeatureMenu();
    //transform from BOX(-174.173506487 -18.788241791,-173.86528589 -18.5190063499999) to [[-73.9876, 40.7661], [-73.9397, 40.8002]]
    let points = feature.extent.substr(4, feature.extent.length-5).replace(/ /g,",").split(",");
    //get the points as numbers
    let nums = points.map((item) => {return Number(item)});
    //zoom to the feature
    this.map.fitBounds([[nums[0], nums[1]],[nums[2], nums[3]]], { padding: 100});
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// DIALOG OPENING/CLOSING FUNCTIONS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  showUserMenu(e) {
    e.preventDefault();
    this.setState({ userMenuOpen: true, menuAnchor: e.currentTarget });
  }
  hideUserMenu(e) {
    this.setState({ userMenuOpen: false });
  }
  showHelpMenu(e) {
    e.preventDefault();
    this.setState({ helpMenuOpen: true, menuAnchor: e.currentTarget });
  }
  hideHelpMenu(e) {
    this.setState({ helpMenuOpen: false });
  }
  openRegisterDialog() {
    this.setState({ registerDialogOpen: true });
  }
  closeRegisterDialog() {
    this.setState({ registerDialogOpen: false });
  }
  openResendPasswordDialog() {
    this.setState({ resendPasswordDialogOpen: true });
  }
  closeResendPasswordDialog() {
    this.setState({ resendPasswordDialogOpen: false });
  }
  openProjectsDialog() {
    this.setState({ projectsDialogOpen: true });
    this.getProjects();
  }
  closeProjectsDialog() {
    this.setState({ projectsDialogOpen: false });
  }
  openNewProjectDialog() {
    this.setState({ newProjectDialogOpen: true });
  }
  closeNewProjectDialog() {
    this.setState({ newProjectDialogOpen: false });
  }
  openNewPlanningGridDialog() {
    this.getCountries();
    this.setState({ NewPlanningGridDialogOpen: true });
  }
  closeNewPlanningGridDialog() {
    this.setState({ NewPlanningGridDialogOpen: false });
  }
  openImportPlanningGridDialog(){
    this.setState({ importPlanningGridDialogOpen: true });
  }
  closeImportPlanningGridDialog(){
    this.setState({ importPlanningGridDialogOpen: false });
  }
  openInfoDialog() {
      this.setState({ openInfoDialogOpen: true, featureMenuOpen: false });
  }
  closeInfoDialog() {
      this.setState({ openInfoDialogOpen: false });
  }

  openOptionsDialog() {
    this.setState({ optionsDialogOpen: true });
    this.hideUserMenu();
  }

  closeOptionsDialog() {
    this.setState({ optionsDialogOpen: false });
  }

  openProfileDialog() {
    this.setState({ profileDialogOpen: true });
    this.hideUserMenu();
  }
  closeProfileDialog() {
    this.setState({ profileDialogOpen: false });
  }
  
  openAboutDialog(){
    this.setState({ aboutDialogOpen: true });
    this.hideHelpMenu();
  }

  closeAboutDialog() {
    this.setState({ aboutDialogOpen: false });
  }
  
  showRunSettingsDialog() {
    this.setState({ settingsDialogOpen: true });
  }
  
  closeRunSettingsDialog() {
    this.setState({ settingsDialogOpen: false });
  }

  openClassificationDialog() {
    this.setState({ classificationDialogOpen: true });
  }
  closeClassificationDialog() {
    this.setState({ classificationDialogOpen: false });
  }

  openImportProjectDialog() {
    this.setState({ importProjectDialogOpen: true });
  }
  closeImportDialog() {
    this.setState({ importProjectDialogOpen: false });
  }
  openUsersDialog() {
    this.getUsers();
    this.setState({ usersDialogOpen: true });
  }
  closeUsersDialog() {
    this.setState({ usersDialogOpen: false });
  }
  closeAlertDialog(){
    this.setState({alertDialogOpen: false});
  }
  hideResults() {
    this.setState({ resultsPanelOpen: false });
  }
  showResults() {
    this.setState({ resultsPanelOpen: true });
  }
  
  toggleInfoPanel() {
    this.setState({ infoPanelOpen: !this.state.infoPanelOpen });
  }
  toggleResultsPanel() {
    this.setState({ resultsPanelOpen: !this.state.resultsPanelOpen });
  }
  
  openRunLogDialog(){
    this.getRunLogs();
    this.setState({runLogDialogOpen: true});
  }
  closeRunLogDialog(){
    this.setState({runLogDialogOpen: false});
  }
  openServerDetailsDialog(){
    this.setState({serverDetailsDialogOpen: true});
    this.hideHelpMenu();
  }
  closeServerDetailsDialog(){
    this.setState({serverDetailsDialogOpen: false});
  }
  openChangePasswordDialog(){
    this.hideUserMenu();
    this.setState({changePasswordDialogOpen: true});
  }
  closeChangePasswordDialog(){
    this.setState({changePasswordDialogOpen: false});
  }
  
  openFailedToDeleteDialog(){
    this.setState({FailedToDeleteDialogOpen: true});
  }
  closeFailedToDeleteDialog(){
    this.setState({FailedToDeleteDialogOpen: false});
  }
  openTargetDialog(){
    this.setState({targetDialogOpen:true});
  }
  closeTargetDialog(){
    this.setState({targetDialogOpen:false});
  }

  openShareableLinkDialog(){
    this.setState({shareableLinkDialogOpen: true});
  }
  closeShareableLinkDialog(){
    this.setState({shareableLinkDialogOpen: false});
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// PROTECTED AREAS LAYERS STUFF
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  changeIucnCategory(iucnCategory) {
    //update the state
    let _metadata = this.state.metadata;
    _metadata.IUCN_CATEGORY = iucnCategory;
    this.setState({ metadata: _metadata });
    //update the input.dat file
    this.updateProjectParameter("IUCN_CATEGORY", iucnCategory);
    //filter the wdpa vector tiles
    this.filterWdpaByIucnCategory(iucnCategory);
    //render the wdpa intersections on the grid
    this.renderPAGridIntersections(iucnCategory);
  }

  filterWdpaByIucnCategory(iucnCategory) {
    //get the individual iucn categories
    let iucnCategories = this.getIndividualIucnCategories(iucnCategory);
    //TODO FILTER THE WDPA CLIENT SIDE BY INTERSECTING IT WITH THE PLANNING GRID
    //filter the vector tiles for those iucn categories - and if the planning unit name has an iso3 country code - then use that as well. e.g. pu_ton_marine_hexagon_50 (has iso3 code) or pu_a4402723a92444ff829e9411f07e7 (no iso3 code)
    //let filterExpr = (this.state.metadata.PLANNING_UNIT_NAME.match(/_/g).length> 1) ? ['all', ['in', 'IUCN_CAT'].concat(iucnCategories), ['==', 'PARENT_ISO', this.state.metadata.PLANNING_UNIT_NAME.substr(3, 3).toUpperCase()]] : ['all', ['in', 'IUCN_CAT'].concat(iucnCategories)];
    let filterExpr = ['all', ['in', 'iucn_cat'].concat(iucnCategories)]; // no longer filter by ISO code
    this.map.setFilter(WDPA_LAYER_NAME, filterExpr);
    //turn on/off the protected areas legend
    (iucnCategory === "None") ? this.hidePALegend() : this.showPALegend();
  }

  getIndividualIucnCategories(iucnCategory) {
    let retValue = [];
    switch (iucnCategory) {
      case 'None':
        retValue = [''];
        break;
      case 'IUCN I-II':
        retValue = ['Ia', 'Ib', 'II'];
        break;
      case 'IUCN I-IV':
        retValue = ['Ia', 'Ib', 'II', 'III', 'IV'];
        break;
      case 'IUCN I-V':
        retValue = ['Ia', 'Ib', 'II', 'III', 'IV', 'V'];
        break;
      case 'IUCN I-VI':
        retValue = ['Ia', 'Ib', 'II', 'III', 'IV', 'V', 'VI'];
        break;
      case 'All':
        retValue = ['Ia', 'Ib', 'II', 'III', 'IV', 'V', 'VI','Not Reported'];
        break;
      default:
    }
    return retValue;
  }

  //gets the puids for those protected areas that intersect the planning grid in the passed iucn category
  getPuidsFromIucnCategory(iucnCategory) {
    let intersections_by_category = this.getIntersections(iucnCategory);
    //get all the puids in this iucn category 
    let puids = this.getPuidsFromNormalisedData(intersections_by_category);
    return puids;
  }

  //called when the iucn category changes - gets the puids that need to be added/removed, adds/removes them and updates the PuEdit layer
  async renderPAGridIntersections(iucnCategory) {
    await this.preprocessProtectedAreas(iucnCategory).then((intersections) => {
      //get all the puids of the intersecting protected areas in this iucn category 
      let puids = this.getPuidsFromIucnCategory(iucnCategory);
      //see if any of them will overwrite existing manually edited planning units - these will be in status 1 and 3
      let manuallyEditedPuids = this.getPlanningUnitsByStatus(1).concat(this.getPlanningUnitsByStatus(3));
      let clashingPuids = manuallyEditedPuids.filter(value => -1 !== puids.indexOf(value));
      if (clashingPuids.length > 0){
        //remove them from the puids
        puids = puids.filter((item) => !clashingPuids.includes(item));
        this.setSnackBar("Not all planning units have been added. See <a href='" + ERRORS_PAGE + "#not-all-planning-units-have-been-added' target='blank'>here</a>");
      }
      //get all the puids for the existing iucn category - these will come from the previousPuids rather than getPuidsFromIucnCategory as there may have been some clashes and not all of the puids from getPuidsFromIucnCategory may actually be renderered
      //if the previousPuids are undefined then get them from the projects previousIucnCategory
      let previousPuids = (this.previousPuids !== undefined) ? this.previousPuids : this.getPuidsFromIucnCategory(this.previousIucnCategory);
      //set the previously selected puids
      this.previousPuids = puids;
      //and previousIucnCategory
      this.previousIucnCategory = iucnCategory;
      //rerender
      this.updatePlanningUnits(previousPuids, puids);
    }).catch((error) => {
      this.setSnackBar(error);
    });
  }

  //updates the planning units by reconciling the passed arrays of puids
  updatePlanningUnits(previousPuids, puids){
    //copy the current planning units state
    let statuses = this.state.planning_units;
    //get the new puids that need to be added
    let newPuids = this.getNewPuids(previousPuids, puids);
    if (newPuids.length === 0) {
      //get the puids that need to be removed
      let oldPuids = this.getNewPuids(puids, previousPuids);
      this.removePuidsFromArray(statuses, 2, oldPuids);
    }
    else {
      //add all the new protected area intersections into the planning units as status 2
      this.appPuidsToPlanningUnits(statuses, 2, newPuids);
    }
    //update the state
    this.setState({ planning_units: statuses });
    //re-render the layer
    this.renderPuEditLayer();
    //update the pu.dat file
    this.updatePuDatFile();
  }
  
  getNewPuids(previousPuids, puids) {
    return puids.filter((i) => {
      return previousPuids.indexOf(i) === -1;
    });
  }

  //turns on the legend for the protected areas
  showPALegend(){
    this.setState({pa_layer_visible:true});
  }
  
  //hides the protected area legend
  hidePALegend(){
    this.setState({pa_layer_visible:false});  
  }
  preprocessProtectedAreas(iucnCategory) {
    //have the intersections already been calculated
    if (this.protected_area_intersections.length>0) {
      return Promise.resolve(this.protected_area_intersections);
    }
    else {
      //do the intersection on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket 
        this._ws("preprocessProtectedAreas?user=" + this.state.owner + "&project=" + this.state.project + "&planning_grid_name=" + this.state.metadata.PLANNING_UNIT_NAME, this.wsMessageCallback.bind(this)).then((message) => {
          //set the local variable
          this.protected_area_intersections = message.intersections;
          //return a value to the then() call
          resolve(message);
        }).catch((error) => {
          reject(error);
        });
      }); //return
    }
  }

  getIntersections(iucnCategory) {
    //get the individual iucn categories
    let iucn_categories = this.getIndividualIucnCategories(iucnCategory);
    //get the planning units that intersect the protected areas with the passed iucn category
    return this.protected_area_intersections.filter((item) => { return (iucn_categories.indexOf(item[0]) > -1); });
  }

  //downloads and updates the WDPA on the server
  updateWDPA(){
    //start the logging
    this.startLogging();
    //call the webservice
    return new Promise((resolve, reject) => {
      this._ws("updateWDPA?downloadUrl=" + window.WDPA.downloadUrl + "&wdpaVersion=" + window.WDPA.latest_version, this.wsMessageCallback.bind(this)).then((message) => {
        //websocket has finished - set the new version of the wdpa
        let obj = Object.assign(this.state.marxanServer, {wdpa_version: window.WDPA.latest_version});
        //update the state and when it is finished, re-add the wdpa source and layer
        this.setState({newWDPAVersion: false, marxanServer: obj}, ()=> {
          //set the source for the WDPA layer to the new vector tiles
          this.setWDPAVectorTilesLayerName(window.WDPA.latest_version);
          //remove the existing WDPA layer and source
          this.map.removeLayer(WDPA_LAYER_NAME);
          if (this.map && this.map.getSource(WDPA_SOURCE_NAME) !== undefined) this.map.removeSource(WDPA_SOURCE_NAME);
          //re-add the WDPA source and layer
          this.addWDPASource();
          this.addWDPALayer();
          //reset the protected area intersections on the client
          this.protected_area_intersections = [];
          //recalculate the protected area intersections and refilter the vector tiles
          this.changeIucnCategory(this.state.metadata.IUCN_CATEGORY);
        });
        resolve(message);
      }).catch((error) => {
        reject(error);
      });
    }); //return
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// BOUNDARY LENGTH MODIFIER AND CLUMPING
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async preprocessBoundaryLengths(iucnCategory) {
    if (this.state.files.BOUNDNAME){ //if the bounds.dat file already exists
      return Promise.resolve();
    }else{
      //calculate the boundary lengths on the server
      return new Promise((resolve, reject) => {
        //start the logging
        this.startLogging();
        //call the websocket 
        this._ws("preprocessPlanningUnits?user=" + this.state.owner + "&project=" + this.state.project, this.wsMessageCallback.bind(this)).then((message) => {
          //update the state
          var currentFiles = this.state.files;
          currentFiles.BOUNDNAME = "bounds.dat";
          this.setState({files: currentFiles});
          //return a value to the then() call
          resolve(message);
        }).catch((error) => {
          reject(error);
        });
      }); //return
    }
  }

  showClumpingDialog(){
    //update the map centre and zoom state which is used by the maps in the clumping dialog
    this.updateMapCentreAndZoom();
    //when the boundary lengths have been calculated
    this.preprocessBoundaryLengths().then((intersections) => {
      //update the spec.dat file with any that have been added or removed or changed target or spf
      this.updateSpecFile().then((value) => {
        //when the species file has been updated, update the planning unit file 
        this.updatePuFile();
        //when the planning unit file has been updated, update the PuVSpr file - this does all the preprocessing using web sockets
        this.updatePuvsprFile().then((value) => {
          //show the clumping dialog
          this.setState({ clumpingDialogOpen: true, clumpingRunning: true });
        });
      }).catch((error) => { //updateSpecFile error
        
      });
    }).catch((error) => { //preprocessBoundaryLengths error
      console.log(error);
    }); 
  }

  hideClumpingDialog(){
    //return state to normal
    this.setState({ clumpingDialogOpen: false });
  }

  setClumpingRunning(value){
    this.setState({clumpingRunning:value});
  }
  
  setBlmValue(blmValue){
    var newRunParams = [], value;
    //iterate through the run parameters and update the value for the blm
    this.state.runParams.forEach((item) => {
      value = (item.key === 'BLM') ? String(blmValue) : item.value;
      newRunParams.push({key: item.key, value: value});
    });
    //update this run parameters
    this.updateRunParams(newRunParams);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// MANAGING RUNS
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //returns the log of all of the runs from the server
  getRunLogs(){
    if (!this.state.unauthorisedMethods.includes("getRunLogs")){
      this._get("getRunLogs").then((response) => {
          this.setState({runLogs: response.data});
      });
    }
  }
  
  //clears the records from the run logs file
  clearRunLogs(){
    this._get("clearRunLogs").then((response) => {
        this.getRunLogs();
    });
  }
  
  getShareableLink(){
    this.openShareableLinkDialog();
  }
  
  render() {
    const message = (<span id="snackbar-message-id" dangerouslySetInnerHTML={{ __html: this.state.snackbarMessage }} />);    
    return (
      <MuiThemeProvider>
        <React.Fragment>
          <div ref={el => this.mapContainer = el} className="absolute top right left bottom" style={{display:'none'}}/>
          <Map
            marxanServer={this.state.marxanServer}
            basemap={this.state.basemap}
            planningGridLoaded={this.planningGridLoaded.bind(this)}
            tilesetid={this.state.tilesetid}
            getMetadata={this.getMetadata.bind(this)}
            resultsLayerPaintProperty={this.state.resultsLayerPaintProperty}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <LoadingDialog
            open={this.state.shareableLink}
          />
          <LoginDialog 
            open={!this.state.loggedIn} 
            onOk={this.validateUser.bind(this)} 
            onCancel={this.openRegisterDialog.bind(this)} 
            loading={this.state.loading} 
            user={this.state.user} 
            password={this.state.password} 
            changeUserName={this.changeUserName.bind(this)} 
            changePassword={this.changePassword.bind(this)} 
            openResendPasswordDialog={this.openResendPasswordDialog.bind(this)}
            marxanServers={this.state.marxanServers}
            selectServer={this.selectServer.bind(this)}
            marxanServer={this.state.marxanServer}
          />
          <RegisterDialog 
            open={this.state.registerDialogOpen} 
            onOk={this.createNewUser.bind(this)}
            onCancel={this.closeRegisterDialog.bind(this)}
            loading={this.state.loading} 
          />
          <ResendPasswordDialog
            open={this.state.resendPasswordDialogOpen} 
            onOk={this.resendPassword.bind(this)}
            onCancel={this.closeResendPasswordDialog.bind(this)}
            loading={this.state.loading} 
            changeEmail={this.changeEmail.bind(this)} 
            email={this.state.resendEmail} 
          />
          <UserMenu 
            open={this.state.userMenuOpen} 
            menuAnchor={this.state.menuAnchor}
            user={this.state.user}
            userRole={this.state.userData.ROLE}
            hideUserMenu={this.hideUserMenu.bind(this)} 
            openOptionsDialog={this.openOptionsDialog.bind(this)}
            openProfileDialog={this.openProfileDialog.bind(this)}
            logout={this.logout.bind(this)}
            marxanServer={this.state.marxanServer}
            openChangePasswordDialog={this.openChangePasswordDialog.bind(this)}
          />
          <HelpMenu 
            open={this.state.helpMenuOpen} 
            menuAnchor={this.state.menuAnchor}
            hideHelpMenu={this.hideHelpMenu.bind(this)} 
            openAboutDialog={this.openAboutDialog.bind(this)}
            openServerDetailsDialog={this.openServerDetailsDialog.bind(this)}
            DOCS_ROOT={DOCS_ROOT}
          />
          <OptionsDialog 
            open={this.state.optionsDialogOpen}
            onOk={this.closeOptionsDialog.bind(this)}
            onCancel={this.closeOptionsDialog.bind(this)}
            loading={this.state.loading} 
            userData={this.state.userData}
            saveOptions={this.saveOptions.bind(this)}
            changeBasemap={this.setBasemap.bind(this)}
            basemaps={this.state.basemaps}
            basemap={this.state.basemap}
          />
          <UsersDialog
            open={this.state.usersDialogOpen}
            onOk={this.closeUsersDialog.bind(this)}
            onCancel={this.closeUsersDialog.bind(this)}
            loading={this.state.loading}
            user={this.state.user}
            users={this.state.users}
            deleteUser={this.deleteUser.bind(this)}
            changeRole={this.changeRole.bind(this)}
            guestUserEnabled={this.state.guestUserEnabled}
            toggleEnableGuestUser={this.toggleEnableGuestUser.bind(this)}
          />
          <ProfileDialog 
            open={this.state.profileDialogOpen}
            onOk={this.closeProfileDialog.bind(this)}
            onCancel={this.closeProfileDialog.bind(this)}
            loading={this.state.loading}
            userData={this.state.userData}
            updateUser={this.updateUser.bind(this)}
          />
          <AboutDialog 
            open={this.state.aboutDialogOpen}
            onOk={this.closeAboutDialog.bind(this)}
            marxanClientReleaseVersion={MARXAN_CLIENT_VERSION}
            wdpaAttribution={this.state.wdpaAttribution}
          />
          <InfoPanel
            open={this.state.infoPanelOpen}
            activeTab={this.state.activeTab}
            project={this.state.project}
            metadata={this.state.metadata}
            runMarxan={this.runMarxan.bind(this)} 
            stopProcess={this.stopProcess.bind(this)}
            pid={this.state.pid}
            renameProject={this.renameProject.bind(this)}
            renameDescription={this.renameDescription.bind(this)}
            features={this.state.projectFeatures}
            project_tab_active={this.project_tab_active.bind(this)}
            features_tab_active={this.features_tab_active.bind(this)}
            pu_tab_active={this.pu_tab_active.bind(this)}
            startPuEditSession={this.startPuEditSession.bind(this)}
            stopPuEditSession={this.stopPuEditSession.bind(this)}
            puEditing={this.state.puEditing}
            clearManualEdits={this.clearManualEdits.bind(this)}
            showRunSettingsDialog={this.showRunSettingsDialog.bind(this)}
            openFeatureMenu={this.openFeatureMenu.bind(this)}
            preprocessing={this.state.preprocessing}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            changeIucnCategory={this.changeIucnCategory.bind(this)}
            updateFeature={this.updateFeature.bind(this)}
            userRole={this.state.userData.ROLE}
            toggleProjectPrivacy={this.toggleProjectPrivacy.bind(this)}
            toggleCosts={this.toggleCosts.bind(this)}
            openTargetDialog={this.openTargetDialog.bind(this)}
            zoomToProjectBounds={this.zoomToProjectBounds.bind(this)}
            getShareableLink={this.getShareableLink.bind(this)}
            marxanServer={this.state.marxanServer}
          />
          <ResultsPanel
            open={this.state.resultsPanelOpen}
            preprocessing={this.state.preprocessing}
            solutions={this.state.solutions}
            loadSolution={this.loadSolution.bind(this)} 
            openClassificationDialog={this.openClassificationDialog.bind(this)}
            hideResults={this.hideResults.bind(this)}
            brew={this.state.brew}
            messages={this.state.logMessages} 
            activeResultsTab={this.state.activeResultsTab}
            legend_tab_active={this.legend_tab_active.bind(this)}
            solutions_tab_active={this.solutions_tab_active.bind(this)}
            log_tab_active={this.log_tab_active.bind(this)}
            clearLog={this.clearLog.bind(this)}
            owner={this.state.owner}
            resultsLayer={this.state.resultsLayer}
            wdpaLayer={ this.state.wdpaLayer }
            pa_layer_visible={this.state.pa_layer_visible}
            changeOpacity={this.changeOpacity.bind(this)}
            results_layer_opacity={this.state.results_layer_opacity}
            wdpa_layer_opacity={this.state.wdpa_layer_opacity}
            userRole={this.state.userData.ROLE}
          />
          <FeatureInfoDialog
            open={this.state.openInfoDialogOpen}
            onOk={this.closeInfoDialog.bind(this)}
            onCancel={this.closeInfoDialog.bind(this)}
            loading={this.state.loading}
            feature={this.state.currentFeature}
            updateFeature={this.updateFeature.bind(this)}
            FEATURE_PROPERTIES={FEATURE_PROPERTIES}
            userRole={this.state.userData.ROLE}
          />
          <Popup
            active_pu={this.state.active_pu} 
            xy={this.state.popup_point}
          />
          <PopupFeatureList
            xy={this.state.popup_point}
            features={this.state.puFeatures}
            loading={this.state.loading}
          />
          <PopupPAList
            xy={this.state.popup_point}
            features={this.state.paFeatures}
            loading={this.state.loading}
          />
          <ProjectsDialog 
            open={this.state.projectsDialogOpen} 
            onOk={this.closeProjectsDialog.bind(this)}
            onCancel={this.closeProjectsDialog.bind(this)}
            loading={this.state.loading}
            projects={this.state.projects}
            oldVersion={this.state.metadata.OLDVERSION}
            deleteProject={this.deleteProject.bind(this)}
            loadProject={this.loadProject.bind(this)}
            cloneProject={this.cloneProject.bind(this)}
            openNewProjectDialog={this.openNewProjectDialog.bind(this)}
            openImportProjectDialog={this.openImportProjectDialog.bind(this)}
            unauthorisedMethods={this.state.unauthorisedMethods}
            userRole={this.state.userData.ROLE}
            getAllFeatures={this.getAllFeatures.bind(this)}
          />
          <NewProjectDialog
            open={this.state.newProjectDialogOpen}
            onOk={this.closeNewProjectDialog.bind(this)}
            loading={this.state.loading}
            getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
            planning_unit_grids={this.state.planning_unit_grids}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            features={this.state.allFeatures} 
            openCostsDialog={this.openCostsDialog.bind(this)}
            selectedCosts={this.state.selectedCosts}
            createNewProject={this.createNewProject.bind(this)}
          />
          <NewPlanningGridDialog 
            open={this.state.NewPlanningGridDialogOpen} 
            onCancel={this.closeNewPlanningGridDialog.bind(this)}
            loading={this.state.loading || this.state.preprocessing}
            createNewPlanningUnitGrid={this.createNewPlanningUnitGrid.bind(this)}
            countries={this.state.countries}
            setSnackBar={this.setSnackBar.bind(this)}
            ERRORS_PAGE={ERRORS_PAGE}
          />
          <ImportPlanningGridDialog
            open={this.state.importPlanningGridDialogOpen} 
            onOk={this.importPlanningUnitGrid.bind(this)}
            onCancel={this.closeImportPlanningGridDialog.bind(this)}
            loading={this.state.loading}
            requestEndpoint={this.state.marxanServer.endpoint}
            SEND_CREDENTIALS={SEND_CREDENTIALS}
            checkForErrors={this.checkForErrors.bind(this)} 
          />
          <FeaturesDialog
            open={this.state.featuresDialogOpen}
            onOk={this.updateSelectedFeatures.bind(this)}
            onCancel={this.closeFeaturesDialog.bind(this)}
            loading={this.state.loading}
            metadata={this.state.metadata}
            allFeatures={this.state.allFeatures}
            deleteFeature={this.deleteFeature.bind(this)}
            openImportFeaturesDialog={this.openImportFeaturesDialog.bind(this)}
            selectAllFeatures={this.selectAllFeatures.bind(this)}
            clearAllFeatures={this.clearAllFeatures.bind(this)}
            selectFeatures={this.selectFeatures.bind(this)}
            userRole={this.state.userData.ROLE}
            clickFeature={this.clickFeature.bind(this)}
            addingRemovingFeatures={this.state.addingRemovingFeatures}
            selectedFeatureIds={this.state.selectedFeatureIds}
            initialiseDigitising={this.initialiseDigitising.bind(this)}
            featuresDialogPopupOpen={this.state.featuresDialogPopupOpen}
            closePopover={this.closePopover.bind(this)}
            showNewFeaturesDialogPopover={this.showNewFeaturesDialogPopover.bind(this)}
            previewFeature={this.previewFeature.bind(this)} 
          />
          <FeatureDialog
            open={this.state.featureDialogOpen}
            onOk={this.closeFeatureDialog.bind(this)}
            onCancel={this.closeFeatureDialog.bind(this)}
            loading={this.state.loading}
            feature_metadata={this.state.feature_metadata}
            getTilesetMetadata={this.getMetadata.bind(this)}
            zoomToBounds={this.zoomToBounds.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <NewFeatureDialog
            open={this.state.NewFeatureDialogOpen} 
            onOk={this.closeNewFeatureDialog.bind(this)}
            onCancel={this.closeNewFeatureDialog.bind(this)}
            loading={this.state.loading}
            createNewFeature={this.createNewFeature.bind(this)}
          />
          <ImportFeaturesDialog
            open={this.state.importFeaturesDialogOpen} 
            importFeatures={this.importFeatures.bind(this)}
            onCancel={this.closeImportFeaturesDialog.bind(this)}
            loading={this.state.loading}
            setFilename={this.setNewFeatureDatasetFilename.bind(this)}
            SEND_CREDENTIALS={SEND_CREDENTIALS}
            filename={this.state.featureDatasetFilename}
            checkForErrors={this.checkForErrors.bind(this)} 
            requestEndpoint={this.state.marxanServer.endpoint}
            preprocessing={this.state.preprocessing}
            unzipShapefile={this.unzipShapefile.bind(this)}
            getShapefileFieldnames={this.getShapefileFieldnames.bind(this)}
            deleteShapefile={this.deleteShapefile.bind(this)}
          />
          <PlanningGridsDialog
            open={this.state.planningGridsDialogOpen}
            onOk={this.closePlanningGridsDialog.bind(this)}
            onCancel={this.closePlanningGridsDialog.bind(this)}
            loading={this.state.loading}
            getPlanningUnitGrids={this.getPlanningUnitGrids.bind(this)}
            unauthorisedMethods={this.state.unauthorisedMethods}
            planningGrids={this.state.planning_unit_grids}
            openNewPlanningGridDialog={this.openNewPlanningGridDialog.bind(this)}
            openImportPlanningGridDialog={this.openImportPlanningGridDialog.bind(this)}
            deletePlanningGrid={this.deletePlanningUnitGrid.bind(this)}
            previewPlanningGrid={this.previewPlanningGrid.bind(this)}
          />
          <FailedToDeleteDialog
            open={this.state.FailedToDeleteDialogOpen} 
            projects={this.state.failedToDeleteProjects}
            userRole={this.state.userData.ROLE}
            onOk={this.closeFailedToDeleteDialog.bind(this)}
            deleteWhat={this.state.deleteWhat}
          />
          <PlanningGridDialog
            open={this.state.planningGridDialogOpen}
            onOk={this.closePlanningGridDialog.bind(this)}
            onCancel={this.closePlanningGridDialog.bind(this)}
            loading={this.state.loading}
            planning_grid_metadata={this.state.planning_grid_metadata}
            getTilesetMetadata={this.getMetadata.bind(this)}
            zoomToBounds={this.zoomToBounds.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <CostsDialog
            open={this.state.CostsDialogOpen}
            onOk={this.closeCostsDialog.bind(this)}
            onCancel={this.closeCostsDialog.bind(this)}
            costs={this.state.costs}
          />
          <RunSettingsDialog
            open={this.state.settingsDialogOpen}
            onOk={this.closeRunSettingsDialog.bind(this)}
            onCancel={this.closeRunSettingsDialog.bind(this)}
            loading={this.state.loading}
            updateRunParams={this.updateRunParams.bind(this)}
            runParams={this.state.runParams}
            showClumpingDialog={this.showClumpingDialog.bind(this)}
            userRole={this.state.userData.ROLE}
          />
          <ClassificationDialog 
            open={this.state.classificationDialogOpen}
            onOk={this.closeClassificationDialog.bind(this)}
            onCancel={this.closeClassificationDialog.bind(this)}
            loading={this.state.loading}
            renderer={this.state.renderer}
            changeColorCode={this.changeColorCode.bind(this)}
            changeRenderer={this.changeRenderer.bind(this)}
            changeNumClasses={this.changeNumClasses.bind(this)}
            changeShowTopClasses={this.changeShowTopClasses.bind(this)}
            summaryStats={this.state.summaryStats}
            brew={this.state.brew}
            dataBreaks={this.state.dataBreaks}
          />
          <ClumpingDialog
            open={this.state.clumpingDialogOpen}
            onOk={this.hideClumpingDialog.bind(this)}
            onCancel={this.hideClumpingDialog.bind(this)}
            _get={this._get.bind(this)}
            owner={this.state.owner}
            project={this.state.project}
            startMarxanJob={this.startMarxanJob.bind(this)}
            getSolution={this.getSolution.bind(this)}
            getPaintProperties={this.getPaintProperties.bind(this)}
            tileset={this.state.tileset}
            RESULTS_LAYER_NAME={RESULTS_LAYER_NAME}
            mapCentre={this.state.mapCentre}
            mapZoom={this.state.mapZoom}
            setBlmValue={this.setBlmValue.bind(this)}
            setClumpingRunning= {this.setClumpingRunning.bind(this)}
            clumpingRunning={this.state.clumpingRunning}
          />
          <ImportProjectDialog
            open={this.state.importProjectDialogOpen}
            onOk={this.closeImportDialog.bind(this)}
            loading={this.state.loading}
            requestEndpoint={this.state.marxanServer.endpoint}
            SEND_CREDENTIALS={SEND_CREDENTIALS}
            importProject={this.importProject.bind(this)}
            checkForErrors={this.checkForErrors.bind(this)} 
            log={this.log.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
          />
          <RunLogDialog
            open={this.state.runLogDialogOpen}
            onOk={this.closeRunLogDialog.bind(this)}
            onRequestClose={this.closeRunLogDialog.bind(this)}
            loading={this.state.loading}
            preprocessing={this.state.preprocessing}
            unauthorisedMethods={this.state.unauthorisedMethods}
            runLogs={this.state.runLogs}
            getRunLogs={this.getRunLogs.bind(this)}
            clearRunLogs={this.clearRunLogs.bind(this)}
            stopMarxan={this.stopProcess.bind(this)}
          />
          <ServerDetailsDialog  
            open={this.state.serverDetailsDialogOpen}
            onOk={this.closeServerDetailsDialog.bind(this)}
            onRequestClose={this.closeServerDetailsDialog.bind(this)}
            newWDPAVersion={this.state.newWDPAVersion}
            marxanServer={this.state.marxanServer}
            updateWDPA={this.updateWDPA.bind(this)}
            loading={this.state.preprocessing}
          />
          <ChangePasswordDialog  
            open={this.state.changePasswordDialogOpen}
            onOk={this.closeChangePasswordDialog.bind(this)}
            user={this.state.user}
            onRequestClose={this.closeChangePasswordDialog.bind(this)}
            checkPassword={this.checkPassword.bind(this)}
            setSnackBar={this.setSnackBar.bind(this)}
            updateUser={this.updateUser.bind(this)}
          />
          <AlertDialog
            open={this.state.alertDialogOpen}
            onOk={this.closeAlertDialog.bind(this)}
          />
          <Snackbar
            open={this.state.snackbarOpen}
            message={message}
            onRequestClose={this.closeSnackbar.bind(this)}
            style={{maxWidth:'800px !important'}} 
            contentStyle={{maxWidth:'800px !important'}}
            bodyStyle={{maxWidth:'800px !important'}}
          />
          <Popover open={this.state.featureMenuOpen} anchorEl={this.state.menuAnchor} onRequestClose={this.closeFeatureMenu.bind(this)} style={{width:'307px'}}>
            <Menu style={{width:'207px'}} onMouseLeave={this.closeFeatureMenu.bind(this)} >
              <MenuItemWithButton leftIcon={<Properties style={{margin: '1px'}}/>} onClick={this.openInfoDialog.bind(this)}>Properties</MenuItemWithButton>
              <MenuItemWithButton leftIcon={<RemoveFromProject style={{margin: '1px'}}/>} style={{display: ((this.state.currentFeature.old_version)||(this.state.userData.ROLE === "ReadOnly")) ? 'none' : 'block'}} onClick={this.removeFromProject.bind(this, this.state.currentFeature)}>Remove from project</MenuItemWithButton>
              <MenuItemWithButton leftIcon={(this.state.currentFeature.feature_layer_loaded) ? <RemoveFromMap style={{margin: '1px'}}/> : <AddToMap style={{margin: '1px'}}/>} style={{display: (this.state.currentFeature.tilesetid) ? 'block' : 'none'}} onClick={this.toggleFeatureLayer.bind(this, this.state.currentFeature)}>{(this.state.currentFeature.feature_layer_loaded) ? "Remove from map" : "Add to map"}</MenuItemWithButton>
              <MenuItemWithButton leftIcon={(this.state.puvsprLayerText === HIDE_PUVSPR_LAYER_TEXT) ? <RemoveFromMap style={{margin: '1px'}}/> : <AddToMap style={{margin: '1px'}}/>} onClick={this.toggleFeaturePuvsprLayer.bind(this, this.state.currentFeature)} disabled={!(this.state.currentFeature.preprocessed && this.state.currentFeature.occurs_in_planning_grid)}>{this.state.puvsprLayerText}</MenuItemWithButton>
              <MenuItemWithButton leftIcon={<ZoomIn style={{margin: '1px'}}/>} style={{display: (this.state.currentFeature.extent) ? 'block' : 'none'}} onClick={this.zoomToFeature.bind(this, this.state.currentFeature)}>Zoom to feature extent</MenuItemWithButton>
              <MenuItemWithButton leftIcon={<Preprocess style={{margin: '1px'}}/>} style={{display: ((this.state.currentFeature.old_version)||(this.state.userData.ROLE === "ReadOnly")) ? 'none' : 'block'}} onClick={this.preprocessSingleFeature.bind(this, this.state.currentFeature)} disabled={this.state.currentFeature.preprocessed || this.state.preprocessing}>Pre-process</MenuItemWithButton>
            </Menu>
          </Popover>   
          <TargetDialog 
            open={this.state.targetDialogOpen}
            onOk={this.closeTargetDialog.bind(this)}
            showCancelButton={true}
            onCancel={this.closeTargetDialog.bind(this)}
            updateTargetValueForFeatures={this.updateTargetValueForFeatures.bind(this)}
          />
          <ShareableLinkDialog
            open={this.state.shareableLinkDialogOpen}
            onOk={this.closeShareableLinkDialog.bind(this)}
            shareableLinkUrl={window.location + "?server=" + this.state.marxanServer.name + "&user=" + this.state.user + "&project=" + this.state.project}
          />
          <AppBar
            open={this.state.loggedIn}
            user={this.state.user}
            userRole={this.state.userData.ROLE}
            infoPanelOpen={this.state.infoPanelOpen}
            resultsPanelOpen={this.state.resultsPanelOpen}
            openProjectsDialog={this.openProjectsDialog.bind(this)}
            openFeaturesDialog={this.openFeaturesDialog.bind(this)}
            openPlanningGridsDialog={this.openPlanningGridsDialog.bind(this)}
            toggleInfoPanel={this.toggleInfoPanel.bind(this)}
            toggleResultsPanel={this.toggleResultsPanel.bind(this)}
            showUserMenu={this.showUserMenu.bind(this)}
            showHelpMenu={this.showHelpMenu.bind(this)}
            openUsersDialog={this.openUsersDialog.bind(this)}
            openRunLogDialog={this.openRunLogDialog.bind(this)}
          />
        </React.Fragment>
      </MuiThemeProvider>
    );
  }
}

export default App;

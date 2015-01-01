//
//Externs file for Google Closure Compiler
//
var Loader = { 
		VERSION: null,
		deleteRuntime: function(){}
};

var Logger = {
		logEvents: null,
		log: function(){}
};

var KeyHandler = {
		keyDown: function(){}
};

var pluginPlayer = {};
pluginPlayer.SetDisplayArea = function(){};
pluginPlayer.Resume = function(){};
pluginPlayer.Pause = function(){};
pluginPlayer.Play = function(){};
pluginPlayer.Stop = function(){};
pluginPlayer.JumpForward = function(){};
pluginPlayer.JumpBackward = function(){};
pluginPlayer.GetCurrentBitrates = function(){};
pluginPlayer.GetDuration = function(){};
pluginPlayer.InitPlayer = function(){};
pluginPlayer.StartPlayback = function(){};
pluginPlayer.SetTotalBufferSize = function(){};
pluginPlayer.SetInitialBuffer = function(){};
pluginPlayer.SetPendingBuffer = function(){};
pluginPlayer.OnConnectionFailed;
pluginPlayer.OnAuthenticationFailed;
pluginPlayer.OnStreamNotFound;
pluginPlayer.OnNetworkDisconnected;
pluginPlayer.OnRenderError;
pluginPlayer.OnRenderingComplete;
pluginPlayer.OnStreamInfoReady;
pluginPlayer.OnBufferingStart;
pluginPlayer.OnBufferingComplete;
pluginPlayer.OnBufferingProgress;
pluginPlayer.OnCurrentPlayTime;

var pluginNNavi = {};
pluginNNavi.GetFirmware = function(){};
pluginNNavi.GetModelCode = function(){};
pluginNNavi.SetBannerState = function(){};

var Common = {};
Common.API = {};
Common.API.Plugin = function(){};
Common.API.Widget = function(){};
Common.API.TVKeyValue = function(){};
var pluginAPI;
pluginAPI.setOnScreenSaver = function(){};
pluginAPI.setOffScreenSaver = function(){};
pluginAPI.unregistKey = function(){};
var widgetAPI;
widgetAPI.sendReadyEvent = function(){};
widgetAPI.blockNavigation = function(){};
widgetAPI.sendReturnEvent = function(){};

function FileSystem() {
	this.isValidCommonPath = function(){};
	this.createCommonDir = function(){};
	this.openCommonFile = function(){};
	this.closeCommonFile = function(){};
	this.deleteCommonFile = function(){};
	this.deleteCommonDir = function(){};
}

var file = {
		readAll: function(){},
		writeAll: function(){}
};

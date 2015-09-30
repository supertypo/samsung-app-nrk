//	Copyright (C) 2015 Marius Thøring (mthoring@gmail.com)
//
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License, or
//	(at your option) any later version.
//	
//	This program is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//	
//	You should have received a copy of the GNU General Public License
//	along with this program.  If not, see <http://www.gnu.org/licenses/>.
var Main = {
		SCREENSAVER_TIME: 600,
		MODERN_FIRMWARE_MIN: "T-INFOLINK2012-1000",
		URL_HOME: "http://marius.thoering.no",
		firmware: null,
		screenSaverEnabled: false,
		dataDirectory : null
};

Main.getVersion = function() {
	return Config.VERSION;
};

Main.patch = function() {
	var css = document.createElement("style");
	css.type = "text/css";
	css.innerHTML = 
	".background {" +
	"   background-size: cover !important;" +
	"}" +
	".menu_element {" +
	"   padding-bottom: 5px;" +
	"}" +
	".infoElement {" +
	"   padding-bottom: 5px;" +
	"}" +
	".epgSub {" +
	"	max-height: 575px !important;" +
	"	background-color: rgba(0,0,0,0.9) !important;" +
	"}" +
	"#thumbnail {" +
	"	display: none;" +
	"	height: 268px;" +
	"	margin-bottom: 10px;" +
	"	background-position: center;" +
	"	background-repeat: no-repeat;" +
	"	background-size: cover;" +
	"} ";
	document.body.appendChild(css);
};

Main.startApp = function() {
	Main.patch();
	Main.enableScreenSaver();
	Player.init();
	window["onShow"] = KeyHandler.register;
	KeyHandler.register();
	Background.init();
	MenuManager.init();
	Main.logModelAndFirmware();
	Update.check();
	MenuCache.load();
	MediaElementCache.load();
	LastSeen.load();
};

Main.stopApp = function() {
	MenuCache.save();
	MediaElementCache.save();
	LastSeen.save();
	pluginPlayer.Stop();
};

Main.enableScreenSaver = function() {
	if (!Main.screenSaverEnabled) {
		Main.screenSaverEnabled = true;
		pluginAPI.setOnScreenSaver(Main.SCREENSAVER_TIME);
	}
};

Main.disableScreenSaver = function() {
	if (Main.screenSaverEnabled && Player.state == Player.PLAYING && !Graphics.debugEnabled && !MenuManager.menuVisible) {
		Main.screenSaverEnabled = false;
		pluginAPI.setOffScreenSaver();
	}
};

Main.logModelAndFirmware = function() {
	Logger.log("ModelCode:" + Main.getModelCode() + " Firmware:" + Main.getFirmware() 
			+ " (modern: " + Main.isModernFirmware() + ") Browser:" + Main.getBrowser());
};

Main.getFirmware = function() {
	if (Main.firmware == null) {
		Main.firmware = pluginNNavi.GetFirmware();
	}
	return Main.firmware;
};

Main.getModelCode = function() {
	if (Main.modelCode == null) {
		Main.modelCode = pluginNNavi.GetModelCode();
	}
	return Main.modelCode;
};

Main.isModernFirmware = function() {
	return (Main.getFirmware() >= Main.MODERN_FIRMWARE_MIN);
};

Main.getBrowser = function() {
	try {
	    var ua= navigator.userAgent, tem, 
	    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
	    if(/trident/i.test(M[1])){
	        tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
	        return 'IE '+(tem[1] || '');
	    }
	    M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
	    if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	    return M.join(' ');
	} catch (error) {
		return "Unknown";
	}
};

Array.prototype.last = function() {
	return this[this.length-1];
};

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/gm,'');
};

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
var widgetAPI = new Common.API.Widget();
var pluginAPI = new Common.API.Plugin();
var pluginPlayer = document.getElementById("pluginObjectPlayer");
var pluginNNavi = document.getElementById('pluginObjectNNavi');
var tvKey = new Common.API.TVKeyValue();

var Loader = {
	ENABLED: true,
	VERSION: "1.4.0",
	RUNTIME_URL: "http://marius.thoering.no/runtime/",
	RUNTIME_PREFIX: "NRK_Nett_TV_",
	RUNTIME_POSTFIX: ".js",
	RUNTIME_DIR: curWidget.id,
	RUNTIME_FILE: curWidget.id,
	RUNTIME_GET_TIMEOUT_SECONDS: 5, 
	ERROR_EXIT_DELAY_SECONDS: 10
};

Loader.onLoad = function() {
	widgetAPI.sendReadyEvent();
	if(Loader.ENABLED) {
		var url = Loader.RUNTIME_URL + Loader.RUNTIME_PREFIX + Loader.VERSION + Loader.RUNTIME_POSTFIX;
		Logger.log("Downloading app runtime from '" + url + "'");
		$("#channelDescription").html("Laster app...").show();
		$.ajax({
			url: url,
			dataType: "html",
			timeout: (Loader.RUNTIME_GET_TIMEOUT_SECONDS * 1000),
			success: function(content) {
				Loader.saveRuntime(content);
				Logger.log("App runtime downloaded, loading...");
				eval(content);
				window['Main.startApp']();
				$("#channelDescription").html("").hide();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				Logger.log("App runtime download failed");
				var content = Loader.loadRuntime();
				if(content) {
					Logger.log("Previously downloaded runtime found, loading...");
					eval(content);
					window['Main.startApp']();
					$("#channelDescription").html("").hide();
				}
			}
		});
	} else {
		window['Main.startApp']();
	}
};

Loader.loadRuntime = function() {
	var fs = new FileSystem();
	var file = fs.openCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE + "_ver", "r");
	if(file) {
		eval(file.readAll());
		fs.closeCommonFile(file);
		if(SAVED_VERSION == Loader.VERSION) {
			var file = fs.openCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE, "r");
			var content = file.readAll();
			fs.closeCommonFile(file);
			return content;
		} else {
			Logger.log("Previously downloaded runtime is incompatible");
			Loader.deleteRuntime();
			Loader.fail();
		}
	} else {
		Logger.log("No previously downloaded runtime found");
		Loader.fail();
	}
};

Loader.saveRuntime = function(content) {
	var fs = new FileSystem();
	if (!fs.isValidCommonPath(Loader.RUNTIME_DIR)) {
		fs.createCommonDir(Loader.RUNTIME_DIR);
	}
	var file = fs.openCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE, "w");
	file.writeAll(content);
	fs.closeCommonFile(file);
	var file = fs.openCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE + "_ver", "w");
	file.writeLine("SAVED_VERSION = '" + Loader.VERSION + "';");
	fs.closeCommonFile(file);
};

Loader.deleteRuntime = function() {
	var fs = new FileSystem();
	if (fs.isValidCommonPath(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE)
			|| fs.isValidCommonPath(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE + "_ver")) {
		fs.deleteCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE);
		fs.deleteCommonFile(Loader.RUNTIME_DIR + "/" + Loader.RUNTIME_FILE + "_ver");
		if (fs.deleteCommonDir(Loader.RUNTIME_DIR)) {
			Logger.log("Deleted runtime");
		} else {
			Logger.log("Failed to delete runtime");
		}
	} else {
		Logger.log("No runtime found on disk");
	}
};

Loader.fail = function() {
	$("#channelDescription").html("Lasting av app feilet").show();
	setTimeout(function() { widgetAPI.sendReturnEvent(); }, Loader.ERROR_EXIT_DELAY_SECONDS * 1000);	
};

Loader.onUnload = function() {
};

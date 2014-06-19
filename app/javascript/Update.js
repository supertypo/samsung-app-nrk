//	Copyright (C) 2014 Marius Thøring (mthoring@gmail.com)
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
var Update = {
		URL_UPDATE: "http://marius.thoering.no/info/",
		URL_TIMEOUT_SECONDS: 3,
		URL_MAX_RETRIES: 1,
		DISPLAY_INFO_SECONDS: 10,
		DISPLAY_WARNING_SECONDS: 60,
		ID_INFO: "#info",
		currentRetry: 0
};

Update.hide = function() {
	$(Update.ID_INFO).hide();
};

Update.check = function() {
	Logger.log("Checking for updates from " + Update.URL_UPDATE);
	$.ajax({ 
		url: Update.URL_UPDATE + "?appver=" + Main.getVersion() + "&fw=" + Main.getFirmware(),
		type: "GET",
		timeout: (Update.URL_TIMEOUT_SECONDS * 1000),
		dataType: "html",
		success: function(content) {
			content = "<div>" + content + "</div>";
			var genInfo = $(content).find("#genInfo").html();
			var newVer = $(content).find("#newVer").html();
			var minVer = $(content).find("#minVer").html();
			var minVerReason = $(content).find("#minVerReason").html();
			Logger.log("Running app version: " + Main.getVersion() + ", newest available: " + newVer + ", working minimum: " + minVer);
			Update.showInfo(genInfo, newVer, minVer, minVerReason);
		},
		error: function() {
			if(Update.currentRetry < Update.URL_MAX_RETRIES) {
				Logger.log("Update check failed, retrying");
				Update.currentRetry++;
				Update.check();
			} else {
				Logger.log("Update check failed. Max attempts reached, giving up");
			}
		}
	});
};

Update.showInfo = function(genInfo, newVer, minVer, minVerReason) {
	var displaySeconds = Update.DISPLAY_INFO_SECONDS;
	var html = "";
	if(genInfo) {
		html = genInfo + "<br/>";
	}
	if(minVer && Update.isHigherVersionThanInUse(minVer)) {
		html = "Advarsel: Appen er utdatert og må oppdateres! ";
		if(minVerReason) {
			html += "Årsak: " + minVerReason + "<br/>";
		}
		html += "Se " + Main.URL_HOME + " for informasjon om oppdatering.<br/>";
		displaySeconds = Update.DISPLAY_WARNING_SECONDS;
	} else if(newVer && Update.isHigherVersionThanInUse(newVer)) {
		html +=  "En ny version er tilgjengelig. Se " + Main.URL_HOME + " for informasjon om oppdatering.<br/>";
	}
	setTimeout(function() {
		Update.showMaintainerInfo(html, displaySeconds);
	}, 2000);
};

Update.isHigherVersionThanInUse = function(version) {
	var versionArray = version.split(".");
	var curVersionArray = Main.getVersion().split(".");
	
	for(var i=0; i<Math.max(versionArray.length, curVersionArray.length); i++) {
		var versionElem = versionArray[i];
		var curVersionElem = curVersionArray[i];
		if(!versionElem) {
			versionElem = "0";
		} else if(!curVersionElem) {
			curVersionElem = "0";
		}
		versionElem = parseInt(versionElem);
		curVersionElem = parseInt(curVersionElem);
		if(versionElem > curVersionElem) {
			return true;
		} else if(versionElem < curVersionElem) {
			return false;
		}
	}
	return false;
};

Update.showMaintainerInfo = function(html, displaySeconds) {
	var lineCount = (html.match(/<br/gi)||[]).length;
	var initialTop = $(Update.ID_INFO).css("top").replace("px", "");
	var top = initialTop - (30 * lineCount);
	$(Update.ID_INFO).html(html);
	$(Update.ID_INFO).css("top", top + "px");
	setTimeout(function() { $(Update.ID_INFO).css("top", initialTop + "px"); }, displaySeconds * 1000);
};

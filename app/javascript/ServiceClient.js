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
var ServiceClient = {
	REQUEST_TIMEOUT_SECONDS: 10,
	ALIGN_MAX_OFFSET_MINUTES: 10,
	epgCacheArray: []
};

ServiceClient.getCurrentLiveTitle = function(id) {
	var epgDataArray = ServiceClient.getEpgData(id);
	for (var i=0; i<epgDataArray.length; i++) {
		if (epgDataArray[i].isActive) {
			return epgDataArray[i].title;
		}
	}
	return null;
};

ServiceClient.getEpgData = function(id) {
	var currentMillis = new Date().getTime();
	
	// Is already cached and up to date?
	var cachedEpgData = ServiceClient.epgCacheArray[id];
	for (var i=0; cachedEpgData && i < cachedEpgData.length; i++) {
		if (cachedEpgData[i].isActive && cachedEpgData[i].endMillis > currentMillis) {
			Logger.log("Found up to date cached epg data for " + id);
			return cachedEpgData;
		}
	}
	
	// Lookup new epg data
	var epgDataArray = ServiceClient.lookupEpgData(id);

	// Keep a limited history of programs
	for (var i=0; i<epgDataArray.length; i++) {
		if (epgDataArray[i].endMillis > currentMillis) {
			if (i >= 1) {
				epgDataArray = epgDataArray.slice(i - 1);
			}
			if (epgDataArray.length > 4) {
				epgDataArray = epgDataArray.slice(0, 4);
			}
			break;
		}
	}
	ServiceClient.epgCacheArray[id] = epgDataArray;
	return epgDataArray;
};

ServiceClient.lookupEpgData = function(id) {
	var url = Config.API_URL + "channels/" + id + "/epglivebuffer";
	Logger.log("Looking up epg data for " + id + ", using " + url);
	var epgDataArray = [];
	$.ajax({
		dataType: "json",
		async: false,
		url: url,
		timeout: (ServiceClient.REQUEST_TIMEOUT_SECONDS * 1000),
		success: function(content) {
			content.sort(ServiceClient.compareStart);
			for (var i=0; i<content.length; i++) {
				var object = content[i];
				
				var startMillis = parseInt(object["plannedStart"].substring(6, 19));
				var hours = object["duration"].match(/\d+(?=H)/);
				var minutes = object["duration"].match(/\d+(?=M)/);
				var seconds = object["duration"].match(/\d+(?=(\.|S))/);
				var durationMillis = hours ? parseInt(hours) * 60 * 60 * 1000 : 0;
				durationMillis += minutes ? parseInt(minutes) * 60 * 1000 : 0;
				durationMillis += seconds ? parseInt(seconds[0]) * 1000: 0;
				var endMillis = startMillis + durationMillis;

				var fanartUrl = null;
				try {
					fanartUrl = object["image"]["webImages"][3]["imageUrl"]; // pixelWidth:1200
				} catch (error) {
					Logger.log("Fanart: " + id + " - " + object["title"] + " not available");
				}
				
				if (object["programId"] != "NoTransmission") {
					var epgData = {
							id: id,
							title: object["title"],
							description: object["description"],
							fanartUrl: fanartUrl,
							isActive: false,
							startMillis: startMillis,
							endMillis: endMillis,
							duration: durationMillis	
					};
					ServiceClient.updateEndMillis(startMillis, epgDataArray);
					epgDataArray[epgDataArray.length] = epgData;
				}
			}
			// The last program is never marked active in updateEndMillis()
			ServiceClient.markActiveIfApplicable(epgDataArray[epgDataArray.length-1]);			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			Logger.log("Could not open " + url + ", got error: " + textStatus + " - " + errorThrown);
		}
	});
	return epgDataArray;
};

ServiceClient.updateEndMillis = function(millis, epgDataArray) {
	var index = epgDataArray.length - 1;
	if (index != -1) {
		var epgData = epgDataArray[index];
		if (millis - epgData.endMillis < 1000 * 60 * ServiceClient.ALIGN_MAX_OFFSET_MINUTES) {
			epgData.endMillis = millis;
		}
		ServiceClient.markActiveIfApplicable(epgData);
	}
};

ServiceClient.markActiveIfApplicable = function(epgData) {
	var currentMillis = new Date().getTime();
	if(epgData && currentMillis > epgData.startMillis && currentMillis < epgData.endMillis) {
		epgData.isActive = true;
	}
};

ServiceClient.compareStart = function(a, b) {
	return a["plannedStart"] && a["plannedStart"] > b["plannedStart"] ? 1 : -1;
};

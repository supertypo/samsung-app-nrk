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
var MediaElementClient = {
	REQUEST_TIMEOUT_SECONDS: 10,
	CACHE: []
};

MediaElementClient.lookupJsonList = function(menu, mediaElement) {
	var url = mediaElement.url;
	Logger.log("Looking up json list for url: " + url);
	$.ajax({
		dataType: "json",
		async: true,
		url: url,
		timeout: (ServiceClient.REQUEST_TIMEOUT_SECONDS * 1000),
		success: function(content) {
			content = content["Data"];
			var results = [];
			for (var i=0; i<content.length; i++) {
				var object = content[i];
				results.push(new MediaElement(
						WebParserNg.getMediaId(object["Url"]), 
						MediaElementType.PROGRAM,
						object["Title"],
						Config.WEB_URL + object["Url"],
						null,
						null,
						WebParserNg.getImageUrl(object["Url"])
				));
			}
			Logger.log("Found " + results.length + " programs");
			menu.setMediaElements(results);
		},
		error: function() {
			Logger.log("Failed to lookup json list for url: " + url);
		}
	});
};

MediaElementClient.lookupMediaElement = function(mediaId, forceReload, callback) {
	var async = true;
	if (!callback) {
		callback = function() {};
		async = false;
	}
	var result = MediaElementCache.get(mediaId);
	if (forceReload) {
		result = null;
	}
	if (result) {
		Logger.log("Found cached mediaElement: " + mediaId);
		callback(result);
	}
	else {
		Logger.log("Looking up mediaElement for id: " + mediaId + " (async: " + async + ")");
		$.ajax({
			dataType: "json",
			async: async,
			url: Config.API_URL + "mediaelement/" + mediaId,
			timeout: (ServiceClient.REQUEST_TIMEOUT_SECONDS * 1000),
			success: function(content) {
				result = new MediaElement(
						content["id"], 
						MediaElementClient.getType(content),
						MediaElementClient.getTitle(content),
						Config.WEB_URL + content["relativeOriginUrl"],
						content["description"],
						content["mediaUrl"],
						MediaElementClient.getImageUrl(content),
						content["subtitlesUrlPath"]
				);
				MediaElementCache.cache(mediaId, result);
				callback(result);
			},
			error: function() {
				Logger.log("Failed to lookup MediaElement with id: " + mediaId);
			}
		});
	}
	return result;
};

MediaElementClient.getType = function(content) {
	var originType = content["mediaElementType"].toLowerCase();
	if (originType == "live") {
		return MediaElementType.LIVE;
	} else if (originType == "program") {
		return MediaElementType.PROGRAM;
	} else {
		Logger.log("Unknown MediaElement type, assuming " + MediaElementType.PROGRAM + ", origin type: " + originType);
		return MediaElementType.PROGRAM;
	}
};

MediaElementClient.getTitle = function(content) {
	if (content["fullTitle"]) {
		return content["fullTitle"];
	}
	return content["title"];
};

MediaElementClient.getImageUrl = function(content) {
	try {
		var webImages = content["images"]["webImages"];
		return webImages[webImages.length-1]["imageUrl"];
	} catch (error) {
		Logger.log("Couldn't get imageUrl for " + mediaId);
		return null;
	}
};

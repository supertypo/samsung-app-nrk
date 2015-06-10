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
	CACHE: [],
	lookupJsonListRetries: 0
};

MediaElementClient.lookupJsonList = function(menu, mediaElement) {
	var url = mediaElement.url;
	var onError = function() {
		if(MediaElementClient.lookupJsonListRetries < Config.REQUEST_MAX_RETRIES) {
			MediaElementClient.lookupJsonListRetries++;
			Logger.log("Retrying, attempt " + MediaElementClient.lookupJsonListRetries + "/" + Config.REQUEST_MAX_RETRIES);
			MediaElementClient.lookupJsonList(menu, mediaElement);
		} else {
			Logger.log("Failed to lookup json list for url: " + url);
			menu.setMediaElements([]);
		}
	};
	Logger.log("Looking up json list for url: " + url);
	$.ajax({
		dataType: "json",
		async: true,
		url: url,
		timeout: Config.REQUEST_TIMEOUT_SECONDS * 1000,
		success: function(content) {
			if (content && content["data"]) {
				MediaElementClient.lookupJsonListRetries = 0;
				content = content["data"];
				var results = [];
				for (var i=0; i<content.length; i++) {
					var object = content[i];
					var url = object["url"];
					if (url && url != "") {
						results.push(new MediaElement(
								WebParserNg.getMediaId(url), 
								MediaElementType.PROGRAM,
								object["title"],
								Config.WEB_URL + url,
								null,
								null,
								WebParserNg.getImageUrl(url)
						));
					}
				}
				Logger.log("Found " + results.length + " programs");
				menu.preSelectedTitle = null;
				menu.setMediaElements(results);
			} else {
				onError();
			}
		},
		error: onError
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
		callback(result);
	}
	else {
		Logger.log("Looking up mediaElement for id: " + mediaId + " (async: " + async + ")");
		$.ajax({
			dataType: "json",
			async: async,
			url: Config.API_URL + "mediaelement/" + mediaId,
			timeout: Config.REQUEST_TIMEOUT_SECONDS * 1000,
			success: function(content) {
				if (content) {
					var urlPrefix = content["mediaType"] == "Audio" ? Config.RADIO_WEB_URL : Config.WEB_URL;
					if (!content["mediaUrl"]) {
						Logger.log("Using webparser to lookup missing mediaUrl");
						content["mediaUrl"] = WebParserNg.getMediaUrl(urlPrefix + content["relativeOriginUrl"]);
					}
					result = new MediaElement(
							content["id"], 
							MediaElementClient.getType(content),
							MediaElementClient.getTitle(content),
							urlPrefix + content["relativeOriginUrl"],
							content["description"],
							MediaElementClient.changeUrlToHls(content["mediaUrl"]),
							MediaElementClient.getImageUrl(content),
							content["subtitlesUrlPath"]
					);
					MediaElementCache.cache(mediaId, result);
					callback(result);
				} else {
					Logger.log("Failed to lookup MediaElement with id: " + mediaId);
					callback(null);
				}
			},
			error: function() {
				Logger.log("Failed to lookup MediaElement with id: " + mediaId);
				callback(null);
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

MediaElementClient.changeUrlToHls = function(mediaUrl) {
	if(mediaUrl.indexOf("manifest.f4m") != -1) {
		Logger.log("Found flash (" + mediaUrl + "), converting to HLS");
		mediaUrl = mediaUrl.replace("manifest.f4m", "master.m3u8");
		mediaUrl = mediaUrl.replace("http://", "https://");
		mediaUrl = mediaUrl.replace("/z/", "/i/");
		if (mediaUrl.indexOf("?") != -1) {
			mediaUrl = mediaUrl.substring(0, mediaUrl.indexOf("?"));
		}
	}
	return mediaUrl;
};

MediaElementClient.getImageUrl = function(content) {
	try {
		var webImages = content["images"]["webImages"];
		var largeImages = $.grep(webImages, function(e) { return e["pixelWidth"] >= Config.FANART_MIN_WIDTH; });
		largeImages.sort(function(a,b) {
			if(a["pixelWidth"] > b["pixelWidth"]) {
				return 1;
			} else {
				return -1;
			}
		});
		return largeImages[0]["imageUrl"];
	} catch (error) {
		Logger.log("Couldn't get imageUrl for " + mediaId);
		return null;
	}
};

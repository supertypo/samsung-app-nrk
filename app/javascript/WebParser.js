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
var WebParser = {
	REQUEST_TIMEOUT_SECONDS : 10,
	MAX_RETRIES : 1,
	currentRetries : 0,
	mediaFileStart : "data-media=\"",
	mediaFileEnd : "\"",
	subFileStart : "data-subtitlesurl = \"",
	subFileEnd : "\"",
	relativeUrlPrefix : "http://tv.nrk.no",
	urlNew : "http://tv.nrk.no/programmer/nytt",
	urlPopular : "http://tv.nrk.no/programmer/populart",
	urlRecommended : "http://tv.nrk.no/programmer/nyheter",
	urlAll : "http://tv.nrk.no/programmer/",
	urlChildren : "http://tv.nrk.no/programmer/barn/",
	urlDocumentary : "http://tv.nrk.no/programmer/dokumentar-og-fakta/",
	urlMoviesAndSeries : "http://tv.nrk.no/programmer/filmer-og-serier/",
	urlNews : "http://tv.nrk.no/programmer/nyheter/",
	urlSports : "http://tv.nrk.no/programmer/sport/",
};

WebParser.parseAndPlay = function(url) {
	var completeUrl = url;
	if(url.indexOf("http") != 0) {
		completeUrl = WebParser.relativeUrlPrefix + completeUrl;
	}
	Logger.log("Parsing webpage " + completeUrl);
	$.ajax({
		url: completeUrl,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success: function(content) {
			WebParser.loadSubtitle(content);
			var mediaUrl = WebParser.locateUrl(content);
			if (mediaUrl != null && mediaUrl.length > 10) {
				WebParser.currentRetries = 0;
				mediaUrl = WebParser.changeUrlToHls(mediaUrl);
				Player.changeChannel(mediaUrl);
			} else {
				Logger.log("Failed to locate HLS URL, or HLS URL was to short");
				WebParser.retryOnError(WebParser.parseAndPlay, url, null);
			}
		},
		error: function() {
			WebParser.retryOnError(WebParser.parseAndPlay, url, null);
		}
	});
};

WebParser.retryOnError = function(callingMethod, url, menu) {
	if(WebParser.currentRetries < WebParser.MAX_RETRIES) {
		WebParser.currentRetries++;
		Logger.log("Retrying " + url + ", attempt " + WebParser.currentRetries + "/" + WebParser.MAX_RETRIES);
		Graphics.showDescription("Ingen respons, prøver på nytt...");
		callingMethod(url, menu);
	} else {
		Logger.log("Could not open " + url + ", aborting");
		Graphics.showDescription("Ikke kontakt, prøv igjen senere");
		WebParser.currentRetries = 0;
		if (menu != null) {
			MenuManager.keyLeft();
		}
	}
};

WebParser.loadSubtitle = function(content) {
	var startPos = content.indexOf(WebParser.subFileStart)
			+ WebParser.subFileStart.length;
	var endPos = content.indexOf(WebParser.subFileEnd, startPos);
	if (startPos != -1 + WebParser.subFileStart.length && endPos != -1) {
		Subtitle.loadFile(WebParser.relativeUrlPrefix + content.substring(startPos, endPos));
	} else {
		Logger.log("Failed to locate subtitle");
		Subtitle.file = null;
	}
};

WebParser.locateUrl = function(content) {
	var startPos = content.indexOf(WebParser.mediaFileStart)
			+ WebParser.mediaFileStart.length;
	var endPos = content.indexOf(WebParser.mediaFileEnd, startPos);
	if (startPos != -1 + WebParser.mediaFileStart.length && endPos != -1) {
		return content.substring(startPos, endPos);
	} else {
		return null;
	}
};

WebParser.changeUrlToHls = function(mediaUrl) {
	if(mediaUrl.indexOf("manifest.f4m") != -1) {
		Logger.log("Found flash (" + mediaUrl + "), converting to HLS URL");
		mediaUrl = mediaUrl.replace("manifest.f4m", "master.m3u8");
		mediaUrl = mediaUrl.replace("http://", "https://");
		mediaUrl = mediaUrl.replace("/z/", "/i/");
		if (mediaUrl.indexOf("?") != -1) {
			mediaUrl = mediaUrl.substring(0, mediaUrl.indexOf("?"));
		}
	}
	return mediaUrl;
};

WebParser.getAllShowsForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlAll), menu);
};

WebParser.getChildrenShowsForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlChildren), menu);
};

WebParser.getDocumentaryShowsForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlDocumentary), menu);
};

WebParser.getMoviesAndSeriesForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlMoviesAndSeries), menu);
};

WebParser.getNewsForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlNews), menu);
};

WebParser.getSportShowsForLetter = function(letter, menu) {
	WebParser.getResultsForUrl(WebParser.getUrlForLetter(letter, WebParser.urlSports), menu);
};

WebParser.getUrlForLetter = function(letter, url) {
	letter = letter.toLowerCase();
	if (letter == "æ") {
		letter = "ae";
	} else if (letter == "ø") {
		letter = "oe";
	} else if (letter == "å") {
		letter = "aa";
	}
	return url + letter;
};

WebParser.getResultsForUrl = function(url, menu) {
	var callback = function(content) {
		WebParser.currentRetries = 0;
		var itemStart = "<a class=\"programlist-link \"";
		var urlStart = "href=\"";
		var urlEnd = "\"";
		var textStart = ">";
		var textEnd = "</a>";
		var results = WebParser.getLinks(itemStart, urlStart, urlEnd, textStart, textEnd, content);
		results = WebParser.markSeries(results);
		if(results.length > 0) {
			menu.clickable = true;
		} else {
			results[0] = {text: "Ingen programmer funnet", url: null};
		}
		results = WebParser.createOldResults(results);
		menu.setItems(results["texts"], results["urls"]);
	};
	$.ajax({
		url : url,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success : callback,
		error: function() {
			WebParser.retryOnError(WebParser.getResultsForUrl, url, menu);
		}
	});
};

WebParser.markSeries = function(results) {
	for(var i=0; i<results.length; i++) {
		if(results[i]["url"].indexOf("/serie/") == 0) {
			results[i]["text"] += "*";
		}
	}
	return results;
};

WebParser.getSeasonsForShow = function(url, menu) {
	var webPageUrl = WebParser.relativeUrlPrefix + url;
	var callback = function(content) {
		WebParser.currentRetries = 0;
		var itemStart = "href=\"/program/Episodes";
		var urlStart = "/";
		var urlEnd = "\"";
		var textStart = "data-ga-label=\"";
		var textEnd = "\"";
		var results = WebParser.getLinks(itemStart, urlStart, urlEnd, textStart, textEnd, content);
		if(results.length > 0) {
			WebParser.cleanupSeasonNames(results);
			menu.clickable = true;
		} else {
			results[0] = {text: "Ingen", url: null};
		}
		WebParser.sortDescending(results);
		results = WebParser.createOldResults(results);
		menu.setItems(results["texts"], results["urls"]);
	};
	Logger.log("Loading seasons from url " + webPageUrl);
	$.ajax({
		url : webPageUrl,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success : callback,
		error: function() {
			WebParser.retryOnError(WebParser.getSeasonsForShow, url, menu);
		}
	});
};

WebParser.cleanupSeasonNames = function(results) {
	for(var i=0; i<results.length; i++) {
		results[i]["text"] = results[i]["text"].replace("Alle episoder", "Alle");
		results[i]["text"] = results[i]["text"].replace("-Januar", ".01");
		results[i]["text"] = results[i]["text"].replace("-Februar", ".02");
		results[i]["text"] = results[i]["text"].replace("-Mars", ".03");
		results[i]["text"] = results[i]["text"].replace("-April", ".04");
		results[i]["text"] = results[i]["text"].replace("-Mai", ".05");
		results[i]["text"] = results[i]["text"].replace("-Juni", ".06");
		results[i]["text"] = results[i]["text"].replace("-Juli", ".07");
		results[i]["text"] = results[i]["text"].replace("-August", ".08");
		results[i]["text"] = results[i]["text"].replace("-September", ".09");
		results[i]["text"] = results[i]["text"].replace("-Oktober", ".10");
		results[i]["text"] = results[i]["text"].replace("-November", ".11");
		results[i]["text"] = results[i]["text"].replace("-Desember", ".12");
	}
};

WebParser.sortDescending = function(results) {
	results.sort(function(a,b) {
		if(a["text"].length > b["text"].length) {
			return -1;
		} else if(a["text"].length < b["text"].length) {
			return 1;
		} else {
			if(a["text"] > b["text"]) {
				return -1;
			} else if(a["text"] < b["text"]) {
				return 1;
			}
			return 0;
		}
	});
};

WebParser.getEpisodesForSeason = function(url, menu) {
	var webPageUrl = WebParser.relativeUrlPrefix + "/" + url;
	var callback = function(content) {
		WebParser.currentRetries = 0;
		var itemStart = "episode-item ";
		var urlStart = "href=\"";
		var urlEnd = "\"";
		var textStart = "<h3 class=\"episode-list-title\">";
		var textEnd = "<";
		var results = WebParser.getLinks(itemStart, urlStart, urlEnd, textStart, textEnd, content);
		if(results.length > 0) {
			menu.clickable = true;
		} else {
			results[0] = {text: "Ingen episoder funnet", url: null};
		}
		WebParser.sortDescending(results);
		results = WebParser.createOldResults(results);
		menu.setItems(results["texts"], results["urls"]);
	};
	Logger.log("Loading episodes from url " + webPageUrl);
	$.ajax({
		url : webPageUrl,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success : callback,
		error: function() {
			WebParser.retryOnError(WebParser.getEpisodesForSeason, url, menu);
		}
	});
};

WebParser.getNewShows = function(menu) {
	WebParser.getShows(WebParser.urlNew, menu);
};

WebParser.getPopularShows = function(menu) {
	WebParser.getShows(WebParser.urlPopular, menu);
};

WebParser.getRecommendedShows = function(menu) {
	WebParser.getShows(WebParser.urlRecommended, menu);
};

WebParser.getShows = function(url, menu) {
	var callback = function(content) {
		WebParser.currentRetries = 0;
		var itemStart = "<li class=\"listobject";
		var urlStart = "href=\"";
		var urlEnd = "\"";
		var textStart = "alt=\"";
		var textEnd = "\"";
		var results = WebParser.getLinks(itemStart, urlStart, urlEnd, textStart, textEnd, content);
		if(results.length > 0) {
			menu.clickable = true;
		} else {
			results[0] = {text: "Ingen programmer funnet", url: null};
		}
		results = WebParser.createOldResults(results);
		menu.setItems(results["texts"], results["urls"]);
	};
	$.ajax({
		url : url,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success : callback,
		error: function() {
			WebParser.retryOnError(WebParser.getShows, url, menu);
		}
	});
};

WebParser.createOldResults = function(results) {
	var texts = [];
	var urls = [];
	for(var i=0; i<results.length; i++) {
		texts[i] = results[i]["text"];
		urls[i] = results[i]["url"];
	}
	return {"texts": texts, "urls": urls};
};

WebParser.getLinks = function(itemStart, urlStart, urlEnd, textStart, textEnd, content) {
	var startIndex = 0;
	var endIndex;
	var result = [];
	var seenTexts = {};
	for (var i=0; startIndex != -1; i++) {
		startIndex = content.indexOf(itemStart, startIndex + 1);
		if (startIndex != -1 && content.indexOf("no-rights", startIndex) != startIndex + itemStart.length) {
			startIndex = content.indexOf(urlStart, startIndex) + urlStart.length;
			endIndex = content.indexOf(urlEnd, startIndex);
			var url = content.substring(startIndex, endIndex);
			url = url.replace(WebParser.relativeUrlPrefix, "");
			
			startIndex = content.indexOf(textStart, endIndex) + textStart.length;
			endIndex = content.indexOf(textEnd, startIndex);
			var text = content.substring(startIndex, endIndex);
			
			if(!seenTexts[text]) {
				seenTexts[text] = true;
				result[result.length] = {text: text, url: url};
			}
		}
	}
	return result;
};

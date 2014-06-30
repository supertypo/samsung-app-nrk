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
var WebParserNg = {
		REQUEST_TIMEOUT_SECONDS: 5,
		SERIES_PATH_PREFIX: "serie",
		EPISODE_PATH_PREFIX: "Episodes",
		PROGRAM_PATH_PREFIX: "program",
		IMAGE_ENRICH_URL: "http://nrk.eu01.aws.af.cm/f/"
};

WebParserNg.getMediaElements = function(menu, mediaElement) {
	switch (mediaElement.type) {
	case (MediaElementType.ROOT):
		return WebParserNg.getRootMenu(menu);
	case (MediaElementType.LIVE_LIST):
		return WebParserNg.getLiveChannels(menu, mediaElement);
	case (MediaElementType.RECENT):
		return MediaElementClient.lookupJsonList(menu, mediaElement);
//		return WebParserNg.getRecommendedShows(menu, mediaElement);
	case (MediaElementType.POPULAR):
		return MediaElementClient.lookupJsonList(menu, mediaElement);
//		return WebParserNg.getRecommendedShows(menu, mediaElement);
	case (MediaElementType.RECOMMENDED):
		return WebParserNg.getRecommendedShows(menu, mediaElement);
//		return WebParserNg.getCategories(menu, mediaElement, MediaElementType.RECOMMENDED_CAT);
//	case (MediaElementType.RECOMMENDED_CAT):
//		return WebParserNg.getRecommendedShows(menu, mediaElement);
	case (MediaElementType.ALL):
		return WebParserNg.getCategories(menu, mediaElement, MediaElementType.CATEGORY);
	case (MediaElementType.SEARCH):
		return Keyboard.search(menu, mediaElement);
	case (MediaElementType.CATEGORY):
		return WebParserNg.getSubcategories(menu, mediaElement);
	case (MediaElementType.SUBCATEGORY):
		return WebParserNg.getSubcategoryContent(menu, mediaElement);
	case (MediaElementType.SERIES):
		return WebParserNg.getSeasons(menu, mediaElement);
	case (MediaElementType.SEASON):
		return WebParserNg.getEpisodes(menu, mediaElement);
	default:
		Logger.log("Unknown mediaElement.type: " + mediaElement);
	}
};

WebParserNg.getHtml = function(url, callback) {
	if (url) {
		Logger.log("Downloading from url: " + url);
		$.ajax({
			url: url,
			dataType: "html",
			timeout: (WebParserNg.REQUEST_TIMEOUT_SECONDS * 1000),
			async: true,
			success: callback,
			error: function() {
				Logger.log("Download failed, url: " + url);
				callback();
			}
		});
	} else {
		callback();
	}
};

WebParserNg.getRootMenu = function(menu) {
	var mediaElements = [
	       new MediaElement(null, MediaElementType.LIVE_LIST, "Direkte", Config.WEB_URL + "direkte"),
	       new MediaElement(null, MediaElementType.RECENT, "Nytt", Config.WEB_URL + "listobjects/recentlysent.json/page/0/50"),
	       new MediaElement(null, MediaElementType.POPULAR, "Populært", Config.WEB_URL + "listobjects/mostpopular/Week.json/page/0/50"),
//	       new MediaElement(null, MediaElementType.RECENT, "Nytt", Config.WEB_URL + "programmer/nytt"),
//	       new MediaElement(null, MediaElementType.POPULAR, "Populært", Config.WEB_URL + "programmer/populart"),
	       new MediaElement(null, MediaElementType.RECOMMENDED, "Aktuelt", Config.WEB_URL + "programmer/nyheter/nytt"),
	       new MediaElement(null, MediaElementType.ALL, "Arkiv", Config.WEB_URL + "programmer"),
	       new MediaElement(null, MediaElementType.SEARCH, "Søk", Config.WEB_URL + "sok?filter=rettigheter&q="),
	       new MediaElement(null, null, "--------------"),
	       new MediaElement(null, MediaElementType.LIVE_LIST, "Radio direkte", Config.RADIO_WEB_URL + "direkte"),
	       new MediaElement(null, MediaElementType.ALL, "Radio arkiv", Config.RADIO_WEB_URL + "programmer")];
	menu.setMediaElements(mediaElements);
};

WebParserNg.getLiveChannels = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var results = [];
		if (WebParserNg.isRadio(mediaElement.url)) {
			$(html).find(".channel-grid.closed .channel-link").each(function(index, value) {
				results.push(new MediaElement(WebParserNg.getMediaId(value.pathname), MediaElementType.LIVE, value.text.trim()));
			});
		} else {
			$(html).find(".channelLogoImage .c-link").each(function(index, value) {
				$(value).find('span').remove();
				results.push(new MediaElement(WebParserNg.getMediaId(value.pathname), MediaElementType.LIVE, value.text.trim()));
			});
		}
		Logger.log("Found " + results.length + " live channels");
		menu.setMediaElements(results);
	});
};

WebParserNg.getRecommendedShows = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var results = [];
		$(html).find(".listobject-list .listobject-link").each(function(index, value) {
			var titleObj = $(value).find("h3");
			if (titleObj.length > 0) {
				results.push(new MediaElement(WebParserNg.getMediaId(value.pathname), MediaElementType.PROGRAM, 
						titleObj.text(), WebParserNg.getUrlPrefix(mediaElement.url) + value.pathname));
			} else { // Lookup elements with bad title
				var result = MediaElementClient.lookupMediaElement(WebParserNg.getMediaId(value.pathname));
				if (result) {
					results.push(result);
				}
			}
		});
		Logger.log("Found " + results.length + " recommended shows");
		menu.setMediaElements(results);
	});
};

WebParserNg.getCategories = function(menu, mediaElement, mediaElementType) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var results = [];
		$(html).find(".category-menu .buttonbar-link").each(function(index, value) {
			if (value.text == "1814-jubileet") {
			} else if (value.text == "Barn" && (mediaElement.type != MediaElementType.ALL || WebParserNg.isRadio(mediaElement.url))) {
			} else {
				results.push(new MediaElement(null, mediaElementType, value.text, urlPrefix + value.pathname));
			}
		});
		Logger.log("Found " + results.length + " categories");
		menu.setMediaElements(results);
	});
};

WebParserNg.search = function(menu, mediaElement, searchString) {
	WebParserNg.getHtml(mediaElement.url + searchString, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var seen = {};
		var results = [];
		$(html).find("#searchResult .listobject-link").each(function(index, value) {
			var title = value.text.trim();
			if (!seen[title]) {
				seen[title] = true;
				var pathname = value.pathname;
				if (WebParserNg.isSeries(pathname)) {
					results.push(new MediaElement(null, MediaElementType.SERIES, title + "*", 
							urlPrefix + pathname, null, null, WebParserNg.getImageUrl(pathname)));
				} else if (WebParserNg.isProgram(pathname)) {
					results.push(new MediaElement(WebParserNg.getMediaId(pathname), MediaElementType.PROGRAM, title, 
							urlPrefix + pathname, null, null, WebParserNg.getImageUrl(pathname)));
				} else {
					Logger.log("Unknown element: " + value);
				}
			}
		});
		Logger.log("Found " + results.length + " search results");
		menu.setMediaElements(results);
		menu.timestamp = 0;
	});
};

WebParserNg.getSubcategories = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var results = [];
		$(html).find(".category-sub-menu a").each(function(index, value) {
			var dataValue = $(value).attr('data-value');
			if (dataValue) {
				if (dataValue == "0-9") dataValue = "-";
				results.push(new MediaElement(null, MediaElementType.SUBCATEGORY, dataValue, urlPrefix + value.pathname));
			}
		});
		Logger.log("Found " + results.length + " subcategories");
		menu.setMediaElements(results);
	});
};

WebParserNg.getSubcategoryContent = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var results = [];
		$(html).find(".programlist-link:not(.no-on-demand-rights)").each(function(index, value) {
			var pathname = value.pathname;
			if (!WebParserNg.isRadio(mediaElement.url) || value.text.indexOf("Distriktsnyheter") != 0) {
				if (WebParserNg.isSeries(pathname)) {
					results.push(new MediaElement(null, MediaElementType.SERIES, value.text + "*", 
							urlPrefix + pathname, null, null, WebParserNg.getImageUrl(pathname)));
				} else if (WebParserNg.isProgram(pathname)) {
					results.push(new MediaElement(WebParserNg.getMediaId(pathname), MediaElementType.PROGRAM, value.text, 
							urlPrefix + pathname, null, null, WebParserNg.getImageUrl(pathname)));
				} else {
					Logger.log("Unknown element: " + value);
				}
			}
		});
		Logger.log("Found " + results.length + " shows in subcategory");
		menu.setMediaElements(results);
	});
};

WebParserNg.getSeasons = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var results = [];
		$(html).find(".season-link.ga").each(function(index, value) {
			var title = WebParserNg.cleanupSeasonName(value.text);
			if (title) {
				results.push(new MediaElement(null, MediaElementType.SEASON, title, 
						urlPrefix + value.pathname, null, null, WebParserNg.getImageUrl(value.pathname)));
			}
		});
		Logger.log("Found " + results.length + " seasons");
		menu.setMediaElements(WebParserNg.sort(results));
	});
};

WebParserNg.getEpisodes = function(menu, mediaElement) {
	WebParserNg.getHtml(mediaElement.url, function(html) {
		var urlPrefix = WebParserNg.getUrlPrefix(mediaElement.url);
		var results = [];
		$(html).find(".episode-item:not(.no-rights) .p-link").each(function(index, value) {
			$(value).find('.episode-list-title span').remove();
			var title = $(value).find('.episode-list-title').text();
			var pathname = value.pathname;
			results.push(new MediaElement(WebParserNg.getMediaId(pathname), MediaElementType.PROGRAM, title, 
					urlPrefix + pathname, null, null, WebParserNg.getImageUrl(pathname)));
		});
		Logger.log("Found " + results.length + " episodes");
//		menu.setMediaElements(WebParserNg.sort(results));
		menu.setMediaElements(results.reverse());
	});
};

WebParserNg.sanitizePath = function(pathname) {
	return pathname.indexOf("/") == 0 ? pathname : "/" + pathname;
};

WebParserNg.getImageUrl = function(pathname) {
	pathname = WebParserNg.sanitizePath(pathname);
	var pathArray = pathname.split("/");
	if (pathArray.length >= 3 && WebParserNg.isSeries(pathname)) {
		return WebParserNg.IMAGE_ENRICH_URL + pathArray[2];
	} else if (pathArray.length >= 4 && (WebParserNg.isProgram(pathname) 
			|| pathArray[2] == WebParserNg.EPISODE_PATH_PREFIX)) {
		return WebParserNg.IMAGE_ENRICH_URL + pathArray[3];
	} else {
		Logger.log("Cannot enrich mediaElement with image, url not valid: " + pathname);
		return null;
	}
};

WebParserNg.getMediaId = function(pathname) {
	pathname = WebParserNg.sanitizePath(pathname);
	if (pathname) {
		if (WebParserNg.isSeries(pathname)) {
			return pathname.split("/")[3].toLowerCase();
		} else {
			return pathname.split("/")[2].toLowerCase();
		}
	} else {
		Logger.log("Cannot find mediaId for null path");
	}
};

WebParserNg.getUrlPrefix = function(url) {
	if (WebParserNg.isRadio(url)) {
		return Config.RADIO_WEB_URL;
	} else {
		return Config.WEB_URL;
	}
};

WebParserNg.isRadio = function(url) {
	return url.indexOf(Config.RADIO_WEB_URL) == 0;
};

WebParserNg.isSeries = function(pathname) {
	pathname = WebParserNg.sanitizePath(pathname);
	if (pathname.split("/").length > 1 && 
			pathname.split("/")[1] == WebParserNg.SERIES_PATH_PREFIX) {
		return true;
	}
	return false;
};

WebParserNg.isProgram = function(pathname) {
	pathname = WebParserNg.sanitizePath(pathname);
	if (pathname.split("/").length > 1 && 
			pathname.split("/")[1] == WebParserNg.PROGRAM_PATH_PREFIX) {
		return true;
	}
	return false;
};

WebParserNg.isEpisode = function(pathname) {
	pathname = WebParserNg.sanitizePath(pathname);
	if (pathname.split("/").length > 2  && 
			pathname.split("/")[2] == WebParserNg.EPISODE_PATH_PREFIX) {
		return true;
	}
	return false;
};

WebParserNg.cleanupSeasonName = function(text) {
	text = text.replace("Alle episoder", "Alle");
	text = text.replace("Januar", " 01");
	text = text.replace("Februar", " 02");
	text = text.replace("Mars", " 03");
	text = text.replace("April", " 04");
	text = text.replace("Mai", " 05");
	text = text.replace("Juni", " 06");
	text = text.replace("Juli", " 07");
	text = text.replace("August", " 08");
	text = text.replace("September", " 09");
	text = text.replace("Oktober", " 10");
	text = text.replace("November", " 11");
	text = text.replace("Desember", " 12");
	text = text.replace(/-/g, " ");
	text = text.replace(/  /g, " ");
	
	if (WebParserNg.isFutureSeason(text)) {
		return null;
	}
	return text;
};

WebParserNg.isFutureSeason = function(text) {
	var date = new Date();
	date.setMonth(date.getMonth() + 1);
	var month = TimeAndDate.leadingZero(date.getMonth() + 1);
	if (text.indexOf(date.getFullYear() + " " + month) != -1) {
		return true;
	}
	return false;
};

WebParserNg.sort = function(results) {
	results.sort(function(a,b) {
		if(a.title.length > b.title.length) {
			return -1;
		} else if(a.title.length < b.title.length) {
			return 1;
		} else {
			if(a.title > b.title) {
				return -1;
			} else if(a.title < b.title) {
				return 1;
			}
			return 0;
		}
	});
	return results;
};
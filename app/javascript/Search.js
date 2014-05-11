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
var Search = {
	REQUEST_TIMEOUT_SECONDS : 10,
	urlSearch: "http://tv.nrk.no/sok?filter=rettigheter&q="
};
Search.search = function(text, menu) {
	WebParser.getShows(WebParser.urlSearch + text, menu);
};

Search.search = function(text, menu) {
	var callback = function(content) {
		WebParser.currentRetries = 0;
		var itemStart = "<li class=\"listobject";
		var urlStart = "href=\"";
		var urlEnd = "\"";
		var textStart = "alt=\"";
		var textEnd = "\"";
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
		url : Search.urlSearch + text,
		timeout: (WebParser.REQUEST_TIMEOUT_SECONDS * 1000),
		success : callback,
		error: function() {
			WebParser.retryOnError(WebParser.getShows, url, menu);
		}
	});
};

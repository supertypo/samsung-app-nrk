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

var MediaElementType = {
	ROOT: "ROOT",
	LIVE_LIST: "LIVE_LIST",
	RECENT: "RECENT",
	POPULAR: "POPULAR",
	RECOMMENDED: "RECOMMENDED",
	RECOMMENDED_CAT: "RECOMMENDED_CAT",
	ALL: "ALL",
	SEARCH: "SEARCH",
	LASTSEEN: "LASTSEEN",
	LIVE: "LIVE",
	CATEGORY: "CATEGORY",
	SUBCATEGORY: "SUBCATEGORY",
	PROGRAM: "PROGRAM", 
	SERIES: "SERIES",
	SEASON: "SEASON"
};

/** @constructor */
function MediaElement(id, type, title, url, description, mediaUrl, imageUrl, subtitlesUrl) {
	this.id = id;
	this.type = type;
	this.title = title;
	this.url = url;
	this.description = description;
	this.mediaUrl = mediaUrl;
	this.imageUrl = imageUrl;
	this.subtitlesUrl = subtitlesUrl;
}

MediaElement.prototype.toString = function() {
	return "\n======================================\n"
		+ "id: " + this.id + "\n"
		+ "type: " + this.type + "\n"
		+ "title: " + this.title + "\n"
		+ "relativeUrl: " + this.url + "\n"
		+ "description: " + this.description + "\n"
		+ "mediaUrl: " + this.mediaUrl + "\n"
		+ "imageUrl: " + this.imageUrl + "\n"
		+ "subtitlesUrl: " + this.subtitlesUrl + "\n"
		+ "======================================\n";
};

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
var MediaElementCache = {
		STORE_DIR: curWidget.id,
		STORE_FILE: "MediaElementCache",
		store: {}
};

MediaElementCache.cache = function(id, mediaElement) {
	mediaElement.timestamp = new Date().getTime();
	MediaElementCache.store[id] = mediaElement;
};

MediaElementCache.get = function(id) {
	if (id in MediaElementCache.store) {
		var mediaElement = MediaElementCache.store[id];
		if (mediaElement.timestamp + (Config.MEDIA_CACHE_TIMEOUT_HOURS*60*60*1000) > new Date().getTime()) {
			return mediaElement; 
		} else {
			Logger.log("Cached mediaElement is expired, older than " + Config.MEDIA_CACHE_TIMEOUT_HOURS + " hours");
		}
	}
	return null;
};

MediaElementCache.save = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (!fs.isValidCommonPath(MediaElementCache.STORE_DIR)) {
			fs.createCommonDir(MediaElementCache.STORE_DIR);
		}
		var file = fs.openCommonFile(MediaElementCache.STORE_DIR + "/" + MediaElementCache.STORE_FILE, "w");
		file.writeAll(JSON.stringify(MediaElementCache.store));
		fs.closeCommonFile(file);
		Logger.log("Saved MediaElementCache to disk, " + Object.keys(MediaElementCache.store).length + " objects saved");
	}
};

MediaElementCache.load = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		var file = fs.openCommonFile(MediaElementCache.STORE_DIR + "/" + MediaElementCache.STORE_FILE, "r");
		if (file) {
			MediaElementCache.store = JSON.parse(file.readAll());
			fs.closeCommonFile(file);
			MediaElementCache.cleanExpired();
			Logger.log("Loaded MediaElementCache from disk, " + Object.keys(MediaElementCache.store).length + " objects loaded");
		} else {
			Logger.log("Could not read MediaElementCache from disk");
		}
	}
};

MediaElementCache.cleanExpired = function() {
	var deleteCounter = 0;
	for (id in MediaElementCache.store) {
		if (MediaElementCache.store[id].timestamp + (Config.MEDIA_CACHE_TIMEOUT_HOURS*60*60*1000) < new Date().getTime()) {
			delete MediaElementCache.store[id];
			deleteCounter++;
		}
	}
	Logger.log("MediaElementCache cleanup complete, " + deleteCounter + " expired objects removed");
};

MediaElementCache.clear = function() {
	MediaElementCache.store = {};
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (fs.isValidCommonPath(MediaElementCache.STORE_DIR + "/" + MediaElementCache.STORE_FILE)) {
			if(fs.deleteCommonFile(MediaElementCache.STORE_DIR + "/" + MediaElementCache.STORE_FILE)) {
				Logger.log("Deleted MediaElementCache from memory and disk");
			} else {
				Logger.log("Failed to delete MenuCache from disk, only memory cleared");
			}
		} else {
			Logger.log("No MediaElementCache found on disk, only memory cleared");
		}
	} else {
		Logger.log("In-memory MediaElementCache cleared");
	}
};
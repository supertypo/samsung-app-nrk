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
var LastSeen = {
		STORE_DIR: curWidget.id,
		STORE_FILE: "LastSeen",
		store: []
};

LastSeen.put = function(mediaElement) {
	for (var i=0; i<LastSeen.store.length; i++) {
		if (LastSeen.store[i].title == mediaElement.title) {
			LastSeen.store.splice(i, 1);
		}
	}
	while (LastSeen.store.length >= Config.LAST_SEEN_COUNT) {
		LastSeen.store.shift();
	}
	LastSeen.store.push(mediaElement);
};

LastSeen.getAll = function() {
	Logger.log("Found " + LastSeen.store.length + " recently seen shows");
	if (LastSeen.store.length < 2) {
		return LastSeen.store;
	}
	return LastSeen.store.slice().reverse();
};

LastSeen.save = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (!fs.isValidCommonPath(LastSeen.STORE_DIR)) {
			fs.createCommonDir(LastSeen.STORE_DIR);
		}
		var file = fs.openCommonFile(LastSeen.STORE_DIR + "/" + LastSeen.STORE_FILE, "w");
		file.writeAll(JSON.stringify(LastSeen.store));
		fs.closeCommonFile(file);
		Logger.log("Saved LastSeen to disk, " + LastSeen.store.length + " objects saved");
	}
};

LastSeen.load = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		var file = fs.openCommonFile(LastSeen.STORE_DIR + "/" + LastSeen.STORE_FILE, "r");
		if (file) {
			LastSeen.store = JSON.parse(file.readAll());
			if (!LastSeen.store || !LastSeen.store.length) {
				LastSeen.store = [];
			}
			fs.closeCommonFile(file);
			Logger.log("Loaded LastSeen from disk, " + LastSeen.store.length + " objects loaded");
		} else {
			Logger.log("Could not read LastSeen from disk");
		}
	}
};

LastSeen.clear = function() {
	LastSeen.store = [];
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (fs.isValidCommonPath(LastSeen.STORE_DIR + "/" + LastSeen.STORE_FILE)) {
			if(fs.deleteCommonFile(LastSeen.STORE_DIR + "/" + LastSeen.STORE_FILE)) {
				Logger.log("Deleted LastSeen from memory and disk");
			} else {
				Logger.log("Failed to delete LastSeen from disk, only memory cleared");
			}
		} else {
			Logger.log("No LastSeen found on disk, only memory cleared");
		}
	} else {
		Logger.log("In-memory LastSeen cleared");
	}
};

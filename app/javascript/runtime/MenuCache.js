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
var MenuCache = {
		STORE_DIR: curWidget.id,
		STORE_FILE: "MenuCache",
		store : {}
};

MenuCache.cacheMenu = function(id, menu) {
	Logger.log("Caching menu using key: " + id);
	MenuCache.store[id] = menu;
};

MenuCache.getMenu = function(id) {
	Logger.log("Retrieving menu using key: " + id);
	if (id in MenuCache.store) {
		var menu = MenuCache.store[id];
		if (!menu.show || menu.timestamp + (Config.MENU_CACHE_MEMORY_TIMEOUT_MINUTES * 60 * 1000) < new Date().getTime()) {
			Logger.log("Cached menu is expired, older than " + Config.MENU_CACHE_MEMORY_TIMEOUT_MINUTES + " minutes");
			delete MenuCache.store[id];
			menu.isExpired = true;
			return menu;
		}
		return menu;
	} else {
		return null;
	}
};

MenuCache.save = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (!fs.isValidCommonPath(MenuCache.STORE_DIR)) {
			fs.createCommonDir(MenuCache.STORE_DIR);
		}
		for (id in MenuCache.store) {
			var currentMenu = MenuCache.store[id];
			MenuCache.store[id] = { "selectedTitle": currentMenu.selectedTitle, "timestamp": currentMenu.timestamp };
		}
		var file = fs.openCommonFile(MenuCache.STORE_DIR + "/" + MenuCache.STORE_FILE, "w");
		file.writeAll(JSON.stringify(MenuCache.store));
		fs.closeCommonFile(file);
		Logger.log("Saved MenuCache to disk, " + Object.keys(MenuCache.store).length + " objects saved");
	}
};

MenuCache.load = function() {
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		var file = fs.openCommonFile(MenuCache.STORE_DIR + "/" + MenuCache.STORE_FILE, "r");
		if (file) {
			MenuCache.store = JSON.parse(file.readAll());
			fs.closeCommonFile(file);
			MenuCache.cleanExpired();
			Logger.log("Loaded MenuCache from disk, " + Object.keys(MenuCache.store).length + " objects loaded");
		} else {
			Logger.log("Could not read MenuCache from disk");
		}
	}
};

MenuCache.cleanExpired = function() {
	var deleteCounter = 0;
	for (id in MenuCache.store) {
		if (!MenuCache.store[id].timestamp 
				|| MenuCache.store[id].timestamp + (Config.MENU_CACHE_DISK_TIMEOUT_DAYS*24*60*60*1000) < new Date().getTime()) {
			delete MenuCache.store[id];
			deleteCounter++;
		}
	}
	Logger.log("MenuCache cleanup complete, " + deleteCounter + " expired objects removed");
};

MenuCache.clear = function() {
	MenuCache.store = {};
	if (Main.isModernFirmware()) {
		var fs = new FileSystem();
		if (fs.isValidCommonPath(MenuCache.STORE_DIR + "/" + MenuCache.STORE_FILE)) {
			if(fs.deleteCommonFile(MenuCache.STORE_DIR + "/" + MenuCache.STORE_FILE)) {
				Logger.log("Deleted MenuCache from memory and disk");
			} else {
				Logger.log("Failed to delete MenuCache from disk, only memory cleared");
			}
		} else {
			Logger.log("No MenuCache found on disk, only memory cleared");
		}
	} else {
		Logger.log("In-memory MenuCache cleared");
	}
};

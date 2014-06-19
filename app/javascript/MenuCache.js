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
		cache : {}
};

MenuCache.cacheMenu = function(id, menu) {
	MenuCache.cache[id] = menu;
};

MenuCache.getMenu = function(id) {
	if (id in MenuCache.cache) {
		var menu = MenuCache.cache[id];
		if (menu.timestamp + (Config.MENU_CACHE_TIMEOUT_MINUTES * 60 * 1000) < new Date().getTime()) {
			Logger.log("Cached menu is expired, older than " + Config.MENU_CACHE_TIMEOUT_MINUTES + " minutes");
			MenuCache.cache[id] = null;
			return null;
		}
		return menu;
	} else {
		return null;
	}
};

MenuCache.clear = function() {
	MenuCache.cache = {};
	Logger.log("MenuCache cleared");
};
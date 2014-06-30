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
var MenuConst = {
		id: 0
};

MenuConst.getRootMenu = function() {
	var menu = new Menu(null, new MediaElement(null, MediaElementType.ROOT));
	menu.parentMenu = menu;
	return menu;
};

/** @constructor */
function Menu(parentMenu, mediaElement) {
	
	this.setMediaElements = function(mediaElements) {
		this.mediaElements = mediaElements;
		if (this.mediaElements.length > 0) {
			this.timestamp = new Date().getTime();
			this.clickable = true;
			this.loadingBox.remove();
			this.listbox = new MenuListbox(this.menuBox, this.mediaElements);
			this.updateInfo();
		} else {
			this.loadingBox.text("Ingen elementer funnet");
		}
	};
	
	this.show = function() {
		this.menuBox.show();
		this.updateInfo();
	};
	
	this.hide = function() {
		this.menuBox.hide();
	};
	
	this.prev = function() {
		this.listbox.prev();
		this.updateInfo();
	};
	
	this.next = function() {
		this.listbox.next();
		this.updateInfo();
	};
	
	this.updateInfo = function() {
		if (this.mediaElements) {
			clearTimeout(this.updateInfoTimeout);
			var enrich = this.enrich;
			var mediaElement = this.getSelectedMediaElement();
			this.updateInfoTimeout = setTimeout(function() {
				enrich(mediaElement, false, function(enrichedMediaElement) {
					Graphics.displayEpg(enrichedMediaElement);
					Background.change(enrichedMediaElement.imageUrl);
				});
			}, 250);
		}
	};
	
	this.enrich = function(mediaElement, forceReload, callback) {
		if (mediaElement.id) {
			MediaElementClient.lookupMediaElement(mediaElement.id, forceReload, callback);
		} else {
			callback(mediaElement);
		}
	};
	
	this.getSelectedMediaElement = function() {
		return this.mediaElements[this.getIndex()];
	};
	
	this.getSelectedTitle = function() {
		return this.getSelectedMediaElement().title;
	};
	
	this.open = function(callback) {
		this.width = this.menuBox.outerWidth(true);
		var mediaElement = this.getSelectedMediaElement();
		if (mediaElement.type) {
			if (mediaElement.id) {
				this.enrich(mediaElement, true, callback);
			} else {
				callback(this.openMenu(mediaElement));
			}
		} else {
			callback(null);
		}
	};
	
	this.openMenu = function(mediaElement) {
		var name = this.id + ":" + this.getSelectedTitle();
		var menu = MenuCache.getMenu(name);
		if (menu) {
			menu.show();
		} else {
			menu = new Menu(this, mediaElement);
			MenuCache.cacheMenu(name, menu);
		}
		return menu;
	};

	this.getIndex = function() {
		return this.listbox.getIndex();
	};
	
	this.id = "menu" + MenuConst.id++;
	this.parentMenu = parentMenu;
	this.timestamp = 0;

	this.menuBox = $("<span id='" + this.id + "' class='menu_element'></span>");
	$("#menu").append(this.menuBox);
	this.loadingBox = $("<div class='item selected'>Laster...</div>");
	this.menuBox.append(this.loadingBox);
	this.menuBox.show();
	
	WebParserNg.getMediaElements(this, mediaElement);
};


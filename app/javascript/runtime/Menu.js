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
var MenuConst = {
		id: 0
};

MenuConst.getRootMenu = function() {
	return new Menu(null, new MediaElement(null, MediaElementType.ROOT));
};

/** @constructor */
function Menu(parentMenu, mediaElement, expiredMenu) {
	
	this.setMediaElements = function(mediaElements) {
		this.mediaElements = mediaElements;
		if (this.mediaElements.length > 0) {
			this.timestamp = new Date().getTime();
			this.clickable = true;
			this.loadingBox.remove();
			this.listbox = new MenuListbox(this.menuBox, this.mediaElements, this.preSelectedTitle);
			this.updateInfo();
			this.cacheMenu();
		} else {
			this.loadingBox.text("Ingen elementer funnet");
		}
	};
	
	this.cacheMenu = function() {
		this.id = "ROOT";
		if (this.parentMenu) {
			this.id = parentMenu.id + "_" + parentMenu.selectedTitle;
		}
		MenuCache.cacheMenu(this.id, this);
	};
	
	this.show = function() {
		$("#menu").append(this.menuBox);
		if (this.listbox) {
			this.listbox.draw();
		} else {
			this.menuBox.append(this.loadingBox);
		}
		this.updateInfo();
	};
	
	this.hide = function() {
		this.menuBox.empty();
		this.menuBox.remove();
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
					if (enrichedMediaElement) {
						Graphics.displayEpg(enrichedMediaElement);
						if (enrichedMediaElement.type != MediaElementType.LIVE) {
							Background.change(enrichedMediaElement.imageUrl);
						} else {
							Background.change(null);
						}
					} else {
						Graphics.hideEpg();
					}
				});
			}, 500);
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
		var mediaElement = this.mediaElements[this.getIndex()];
		this.selectedTitle = mediaElement.title;
		return mediaElement;
	};
	
	this.open = function(callback) {
		this.width = this.menuBox.outerWidth(true);
		var mediaElement = this.getSelectedMediaElement();
		if (mediaElement.type) {
			if (mediaElement.id) {
				this.enrich(mediaElement, false, callback);
			} else {
				callback(this.openMenu(mediaElement));
			}
		} else {
			callback(null);
		}
	};
	
	this.openMenu = function(mediaElement) {
		var name = this.id + "_" + this.selectedTitle;
		var menu = null;
		var result = MenuCache.getMenu(name);
		if (result) {
			if (result.isExpired) {
				menu = new Menu(this, mediaElement, result);
			} else {
				menu = result;
				menu.parentMenu = this;
				menu.show();
			}
		} else {
			menu = new Menu(this, mediaElement);
		}
		return menu;
	};

	this.getIndex = function() {
		return this.listbox.getIndex();
	};
	
	if (expiredMenu) {
		this.preSelectedTitle = expiredMenu.selectedTitle;
	}
	this.parentMenu = parentMenu;

	this.menuBox = $("<span id='" + this.id + "' class='menu_element'></span>");
	$("#menu").append(this.menuBox);
	this.loadingBox = $("<div class='item selected'>Laster...</div>");
	this.menuBox.append(this.loadingBox);
	this.menuBox.show();
	
	WebParserNg.getMediaElements(this, mediaElement);
};

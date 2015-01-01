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
/** @constructor */
function MenuListbox(menuBox, mediaElements, preSelectedTitle) {

	this.prev = function() {
		this.move(this.index - 1);
	};
	
	this.next = function() {
		this.move(this.index + 1);
	};
	
	this.move = function(toIndex) {
		if(toIndex < 0) {
			this.index = this.endIndex;
		} else if(toIndex > this.endIndex) {
			this.index = 0;
		} else {
			this.index = toIndex;
		}
		this.updateVisibleIndexes();
	};
	
	this.getIndex = function() {
		return this.index;
	};
	
	this.updateVisibleIndexes = function() {
		var newVisibleFromIndex = this.index - (this.index % this.MAX_VISIBLE);
		if(newVisibleFromIndex != this.visibleFromIndex) {
			this.visibleFromIndex = this.index - (this.index % this.MAX_VISIBLE);
			this.visibleToIndex = this.visibleFromIndex + this.MAX_VISIBLE;
			if(this.visibleToIndex > this.mediaElements.length) {
				this.visibleToIndex = this.mediaElements.length;
			}
			this.draw();
		} else {
			this.selectItem();
		}
	};
	
	this.draw = function() {
		this.menuBox.empty();
		for(var i=this.visibleFromIndex; i<this.visibleToIndex; i++) {
			this.menuBox.append(this.menuContent[i]);
		}
		this.selectItem();
	};
	
	this.selectItem = function() {
		if(this.selectedItem != null) {
			this.selectedItem.stop();
			this.selectedItem.scrollLeft(0);
			this.selectedItem.attr("class", "item");
		}
		this.selectedItem = this.menuContent[this.index];
		this.selectedItem.attr("class", "item selected");
		var startScrollDelay = ((Background.CROSSFADE_INTERVAL_SECONDS + Background.getCrossFadeDuration()) * 1000) + 250;
		var menuListbox = this;
		var selectedItem = this.selectedItem;
		setTimeout(function () { menuListbox.scrollItem(selectedItem); }, startScrollDelay);
	};
	
	this.scrollItem = function(item) {
		var scrollWidth = item[0].scrollWidth;
		var width = item.width();
		if(scrollWidth > width) {
			clearTimeout(this.scrollItemTimer);
			this.scrollItemTimer = setTimeout(function(menuListbox) {
				var overflowWidth = scrollWidth - width;
				menuListbox.scrollItemLeft(menuListbox, item, overflowWidth, menuListbox.calculateScrollDuration(overflowWidth));
				}, 0, this
			);
		};
	};
	
	this.scrollItemLeft = function(menuListbox, item, overflowWidth, duration) {
		if(menuListbox.selectedItem == item) {
			item.animate({scrollLeft: overflowWidth}, duration, "swing", function() {
				menuListbox.scrollItemRight(menuListbox, item, overflowWidth, duration);
			});
		}
	};
	
	this.scrollItemRight = function(menuListbox, item, overflowWidth, duration) {
		if(menuListbox.selectedItem == item) {
			item.animate({scrollLeft: 0}, duration, "swing", function() {
				menuListbox.scrollItemLeft(menuListbox, item, overflowWidth, duration);
			});
		}
	};
	
	this.calculateScrollDuration = function(overflowWidth) {
		var perPixelMillis = 15;
		var duration = overflowWidth * perPixelMillis;
		if(duration < 500) {
			duration = 500;
		}
		return duration;
	};
	
	this.createMenuContent = function() {
		for (var i=0; i<this.mediaElements.length; i++) {
			this.menuContent.push($("<div class='item'>" + this.mediaElements[i].title + "</div>"));
		}
	};
	
	this.selectMediaElement = function(title) {
		if (title) {
			for(var i=0; i<mediaElements.length; i++) {
				if (mediaElements[i].title == title) {
					Logger.log("Selected previously selected mediaElement based on title: " + title);
					this.index = i;
				}
			}
		}
		this.updateVisibleIndexes();
	};
	
	this.MAX_VISIBLE = 16;
	this.mediaElements = mediaElements;
	this.menuContent = [];
	this.index = 0;
	this.endIndex = mediaElements.length - 1;
	this.visibleFromIndex = -1;
	this.visibleToIndex = -1;
	this.selectedItem = null;
	
	this.menuBox = menuBox;
	this.createMenuContent();
	this.selectMediaElement(preSelectedTitle);
};
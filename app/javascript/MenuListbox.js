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
function MenuListbox(id, texts) {

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
			if(this.visibleToIndex > this.texts.length) {
				this.visibleToIndex = this.texts.length;
			}
			this.draw();
		} else {
			this.selectItem();
		}
	};
	
	this.draw = function() {
		this.listBox.empty();
		for(var i=this.visibleFromIndex; i<this.visibleToIndex; i++) {
			this.listBox.append("<div class=\"item\">" + this.texts[i] + "</div>");
		}
		this.selectItem();
	};
	
	this.selectItem = function() {
		if(this.selectedItem != null) {
			this.selectedItem.stop();
			this.selectedItem.scrollLeft(0);
			this.selectedItem.attr("class", "item");
		}
		this.selectedItem = this.listBox.find(".item:nth-child(" + ((this.index % this.MAX_VISIBLE) + 1) + ")");
		this.selectedItem.attr("class", "item selected");
		this.scrollItem(this.selectedItem);
	};
	
	this.scrollItem = function(item) {
		var scrollWidth = item[0].scrollWidth;
		var width = item.width();
		var startScrollDelay = ((Background.CROSSFADE_INTERVAL_SECONDS + Background.getCrossFadeDuration()) * 1000) + 250;
		if(scrollWidth > width) {
			clearTimeout(this.scrollItemTimer);
			this.scrollItemTimer = setTimeout(function(menuListbox) {
				var overflowWidth = scrollWidth - width;
				menuListbox.scrollItemLeft(menuListbox, item, overflowWidth, menuListbox.calculateScrollDuration(overflowWidth));
				}, startScrollDelay, this
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
	
	this.MAX_VISIBLE = 15;
	this.id = id;
	this.texts = texts;
	this.index=0;
	this.endIndex = texts.length - 1;
	this.visibleFromIndex = -1;
	this.visibleToIndex = -1;
	this.selectedItem = null;
	
	this.listBox = $(this.id);
	this.updateVisibleIndexes();
};
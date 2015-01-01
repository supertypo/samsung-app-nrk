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
var TimeAndDate = {
		ID_CLOCK : "#clock",
		WALLCLOCK_UPDATE_INTERVAL_SECONDS : 0.2,
		wallClockEnabled : false
};

TimeAndDate.showWallClock = function() {
	TimeAndDate.wallClockEnabled = true;
	TimeAndDate.runWallClock();
	$(TimeAndDate.ID_CLOCK).show();
};

TimeAndDate.hideWallClock = function() {
	TimeAndDate.wallClockEnabled = false;
	$(TimeAndDate.ID_CLOCK).hide();
};

TimeAndDate.fadeInWallClock = function() {
	$(TimeAndDate.ID_CLOCK).css("opacity", "1");
};

TimeAndDate.fadeOutWallClock = function() {
	$(TimeAndDate.ID_CLOCK).css("opacity", "0");
};

TimeAndDate.runWallClock = function() {
	if(TimeAndDate.wallClockEnabled) {
		$(TimeAndDate.ID_CLOCK).html(TimeAndDate.getWallclockTime());
		setTimeout(TimeAndDate.runWallClock, TimeAndDate.WALLCLOCK_UPDATE_INTERVAL_SECONDS * 1000);
	}
};

TimeAndDate.getWallclockTime = function() {
	var date = new Date();
	var day = TimeAndDate.leadingZero(date.getDate());
	var month = TimeAndDate.leadingZero(date.getMonth() + 1);
	var year = date.getFullYear().toString().substring(2);
	//FIXME: handle this properly, tv is buggy
//	date.setUTCHours(date.getUTCHours() + 2);
//	var h = TimeAndDate.leadingZero(date.getUTCHours());
	var h = TimeAndDate.leadingZero(date.getHours());
	var m = TimeAndDate.leadingZero(date.getMinutes());
	var s = TimeAndDate.leadingZero(date.getSeconds());
	return day + "." + month + "." + year + " " + h + ":" + m + ":" + s;
};

TimeAndDate.leadingZero = function(timeElement) {
	if(timeElement < 10) {
		timeElement = "0" + timeElement;
	}
	return timeElement;
};

TimeAndDate.prettyTime = function(seconds) {
	if (typeof seconds == "number") {
		var date = new Date(seconds * 1000);
		var h = date.getUTCHours();
		var m = TimeAndDate.leadingZero(date.getUTCMinutes());
		var s = TimeAndDate.leadingZero(date.getUTCSeconds());
		return h + ":" + m + ":" + s;
	}
	return "--:--:--";
};

TimeAndDate.hoursMinutes = function(millis) {
	var date = new Date(millis);
	//FIXME: handle this properly, tv is buggy
//	date.setUTCHours(date.getUTCHours() + 2);
//	var h = TimeAndDate.leadingZero(date.getUTCHours());
	var h = TimeAndDate.leadingZero(date.getHours());
	date.setMinutes(date.getMinutes() + Math.floor(date.getSeconds() / 60));
	var m = TimeAndDate.leadingZero(date.getMinutes());
	return h + ":" + m;
};

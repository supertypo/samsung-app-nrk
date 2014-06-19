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
var Background = {
		CROSSFADE_INTERVAL_SECONDS: 1,
		DEFAULT_IMAGE : "images/provebilde_nrk_nett-tv_dark.png",
		THUMB_URL_PREFIX : "http://nrk.eu01.aws.af.cm/f/",
		BG_ID_PREFIX : "#background",
		BG_CACHE_ID : "#backgroundCache",
		currentBackground : null,
		bgCounter : 0,
		crossfadeTimer : null,
		crossFadeDuration : 0
};

Background.init = function() {
	Background.currentBackground = Background.DEFAULT_IMAGE;
	$(Background.BG_ID_PREFIX + "0").css("background-image", "url(" + Background.currentBackground + ")");
	$(Background.BG_ID_PREFIX + "1").css("opacity", "0");
};

Background.show = function() {
	Logger.log("Showing current background");
	TimeAndDate.showWallClock();
	$(Background.BG_ID_PREFIX + ((Background.bgCounter + 1) % 2)).show();
	$(Background.BG_ID_PREFIX + (Background.bgCounter % 2)).show();
};

Background.hide = function() {
	Logger.log("Hiding current background");
	TimeAndDate.hideWallClock();
	$(Background.BG_ID_PREFIX + ((Background.bgCounter + 1) % 2)).hide();
	$(Background.BG_ID_PREFIX + (Background.bgCounter % 2)).hide();
};

Background.change = function(url) {
	if(url) {
		Background.delayedCrossfade(url);
	} else {
		Background.showGenericImage();
	}
};

Background.showGenericImage = function() {
	if(Background.currentBackground != Background.DEFAULT_IMAGE) {
		Background.delayedCrossfade(Background.DEFAULT_IMAGE);
	}
};

Background.delayedCrossfade = function(url) {
	clearTimeout(Background.crossfadeTimer);
	$(Background.BG_CACHE_ID).css("background-image", "url(" + url + ")");
	Background.crossfadeTimer = setTimeout(function() {	Background.getImageForShow(url); }, Background.CROSSFADE_INTERVAL_SECONDS * 1000);
};

Background.getImageForShow = function(url) {
	$.ajax({
	    url: url,
	    type:'GET',
	    timeout: 2000,
	    error: function()
	    {
	    	Logger.log("Could not find image: " + url + ", using default");
	    	Background.crossfade(Background.DEFAULT_IMAGE);
	    },
	    success: function()
	    {
	    	Logger.log("Successfully loaded image from " + url);
	    	Background.crossfade(url);
	    }
	});
};

Background.crossfade = function(url) {
	if(url != Background.currentBackground) {
		Background.currentBackground = url;
		Background.showWallClockIfGenericBackground();
		var backgroundOld = Background.BG_ID_PREFIX + (Background.bgCounter % 2); 
		Background.bgCounter = Background.bgCounter + 1;
		var backgroundNew = Background.BG_ID_PREFIX + (Background.bgCounter % 2);
		$(backgroundNew).css("background-image", "url(" + Background.currentBackground + ")");
		$(backgroundOld).css("opacity", "0");
		$(backgroundNew).css("opacity", "1");
	} 
};

Background.showWallClockIfGenericBackground = function() {
	if(Background.currentBackground == Background.DEFAULT_IMAGE) {
		TimeAndDate.fadeInWallClock();
	} else {
		TimeAndDate.fadeOutWallClock();
	}
};

Background.getCrossFadeDuration = function() {
	if(!Background.crossFadeDuration) {
		transitionDelay = $(".background").css("-webkit-transition-duration");
		if(transitionDelay) {
			Background.crossFadeDuration = parseInt(transitionDelay.replace("/[^\\d.]/g", ""));
			Logger.log("Read crossfade duration (transition-duration) from css: " + Background.crossFadeDuration);
		} else {
			Background.crossFadeDuration = 1;
			Logger.log("Couldn't read crossfade duration (transition-duration) from css, using default: " + Background.crossFadeDuration);
		}
	}
	return Background.crossFadeDuration;
};


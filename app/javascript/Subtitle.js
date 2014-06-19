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
var Subtitle = {
		ID_SUBTITLE : "#subtitle",
		OFFSET : -100,
		file : null,
		subs : [],
		currentSub : null,
		currentSubExpire : 0,
		enabled : true,
		timing : 0
};

Subtitle.unload = function() {
	Subtitle.file = null;
	Subtitle.subs = [];
	Subtitle.reset();
};

Subtitle.reset = function() {
	Subtitle.currentSub = null;
	Subtitle.currentSubExpire = 0;
	Subtitle.hide();
};

Subtitle.timingIncrease = function() {
	if(Subtitle.timing < 9900 && Subtitle.file != null && Subtitle.enabled) {
		Subtitle.timing = Subtitle.timing + 100;
		Subtitle.showTimingText();
	}
};

Subtitle.timingDecrease = function() {
	if(Subtitle.timing > -9900 && Subtitle.file != null && Subtitle.enabled) {
		Subtitle.timing = Subtitle.timing - 100;
		Subtitle.showTimingText();
	}
};

Subtitle.timingReset = function() {
	if(Subtitle.file != null && Subtitle.enabled) {
		Subtitle.timing = 0;
		Subtitle.showTimingText();
	}
};

Subtitle.showTimingText = function() {
	if(Subtitle.timing >= 0) {
		Graphics.showPlayerState("Tekst: +" + Subtitle.timing / 100);
	} else {
		Graphics.showPlayerState("Tekst: " + Subtitle.timing / 100);
	}
};

Subtitle.toggle = function() {
	if(Player.state != Player.STOPPED) {
		if(Subtitle.file != null) {
			if(Subtitle.enabled) {
				Logger.log("Subtitles disabled");
				Subtitle.hide();
				Graphics.showPlayerState("Tekst: Av");
			} else {
				Logger.log("Subtitles enabled");
				Graphics.showPlayerState("Tekst: På");
			}
			Subtitle.enabled = !Subtitle.enabled;
		} else {
			Logger.log("Subtitles not available");
			Graphics.showPlayerState("Tekst: --");
		}
	}
};

Subtitle.hide = function() {
	$(Subtitle.ID_SUBTITLE).hide();
};

Subtitle.loadFile = function(url) {
	Subtitle.unload();
	if (url) {
		url = Config.API_URL + url;
		$.ajax({
			url: url,
			dataType: "html",
			success: function(content) {
				Logger.log("Subtitles loaded from '" + url + "', length: " + content.length);
				Subtitle.file = content;
				Subtitle.loadSubs();
			},
			error: function(jqXHR, textStatus, errorThrown) {
				Logger.log("Loading of subtitles '" + url + "' failed, error is: '" + textStatus + "' - '" + errorThrown + "'");
			}
		});
	} else {
		Logger.log("No subtitles available");
	}
};

Subtitle.loadSubs = function() {
	if(Subtitle.file) {
		$(Subtitle.file).find("p").each(function(index, value) {
			var begin = Subtitle.convertTimestampToMillis($(value).attr("begin"));
			var expire = begin + Subtitle.convertTimestampToMillis($(value).attr("dur"));
			var html = Subtitle.sanitize($(value).html());
			Subtitle.subs[Subtitle.subs.length] = {"begin": begin, "expire": expire, "html": html};
		});
	}
};

Subtitle.findAndDisplay = function(currentTimeMillis) {
	if(Subtitle.file != null && Subtitle.enabled) {
		if(currentTimeMillis > Subtitle.currentSubExpire) {
			Subtitle.currentSub = null;
			Subtitle.find(currentTimeMillis);
			Subtitle.display();
		}
	}
};

Subtitle.find = function(currentTimeMillis) {
	for(var i=0; i<Subtitle.subs.length; i++) {
		var begin = Subtitle.subs[i]["begin"] + Subtitle.OFFSET + Subtitle.timing;
		var expire = Subtitle.subs[i]["expire"] + Subtitle.OFFSET + Subtitle.timing;
		
		if(currentTimeMillis >= begin) {
			if(currentTimeMillis < expire) {
				Subtitle.currentSub = Subtitle.subs[i]["html"];
				Subtitle.currentSubExpire = expire;
				break;
			}
		} else {
			break;
		}
	}
};

Subtitle.display = function() {
	if(Subtitle.currentSub != null) {
		$(Subtitle.ID_SUBTITLE).html(Subtitle.currentSub);
		$(Subtitle.ID_SUBTITLE).show();
	} else {
		Subtitle.hide();
	}
};

Subtitle.sanitize = function(html) {
	html = html.replace(/<span style=\"italic\">/gi, "<i>");
	html = html.replace(/<\/span>/gi, "</i>");
	html = html.replace(/&amp;/gi, "&");
	var breakCount = (html.match(/<br/gi)||[]).length;
	if(breakCount == 0) {
		html = "<br/><br/>" + html;
	} else if(breakCount == 1) {
		html = "<br/>" + html;
	}
	return html;
};

Subtitle.convertTimestampToMillis = function(timestamp) {
	var millis = (parseInt(timestamp.split(".")[1]));
	var rest = timestamp.split(".")[0];
	millis += (rest.split(":")[0] * 60*60*1000);
	millis += (rest.split(":")[1] * 60*1000);
	millis += (rest.split(":")[2] * 1000);
	return millis;
};
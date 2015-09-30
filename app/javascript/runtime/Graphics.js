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
var Graphics = {
		DEFAULT_INFO_TIMEOUT_SECONDS : 5,
		DETAIL_TIMEOUT_SECONDS : 60,
		DEBUG_TIMEOUT_SECONDS : 600,
		BUFFER_TIMEOUT_SECONDS : 2,
		DISPLAY_FADEOUT_SECONDS : 1,
		EPG_REFRESH_SECONDS : 30,
		timeoutMap : {},
		detailsEnabled : false,
		debugEnabled : false,
		stateEnabled : false,
		progressEnabled : false,
		descriptionId : "#channelDescription",
		detailsId : "#details",
		epgId : "#epg", 
		epgChannel: null,
		debugId : "#debug",
		playerStateId : "#state",
		bufferId : "#bufferingProgress",
		progressId : "#timeProgress"
};

Graphics.displayEpg = function(mediaElement) {
	if (mediaElement.id && mediaElement.type == MediaElementType.LIVE) {
		Graphics.updateEpg(mediaElement.id, mediaElement.title);
	} else if (mediaElement.type == MediaElementType.PROGRAM) { // || mediaElement.type == MediaElementType.SERIES) {
		Graphics.updateProgramDescription(mediaElement);
	} else {
		Graphics.hideEpg();
	}
};

Graphics.updateProgramDescription = function(mediaElement) {
	var html = "<div id='thumbnail'></div>";
	html += "<div class='epgHeader'>" + mediaElement.title + "</div>";
	
	html += "<div>";
	if (mediaElement.type == MediaElementType.PROGRAM) {
		if (mediaElement.description) {
			html += mediaElement.description;
		} else {
			html += "Ingen beskrivelse tilgjengelig.";
		}
	} else if (mediaElement.type == MediaElementType.SERIES) {
		html += "En serie med en eller flere sesonger.<br/>Velg en episode for å se detaljert beskrivelse...";
	}
	html += "</div>";
	
	html = "<div class='epgSub'>" + html + "</div>";
	$(Graphics.epgId).html(html);
	Graphics.changeThumbnail(mediaElement.imageUrl);
	Graphics.showEpg();
};

Graphics.changeThumbnail = function(url) {
	$("#thumbnail").css("background-image", "none");
	$("#thumbnail").show();
	onError = function() {
		$("#thumbnail").hide();
	};
	if (url) {
		$.ajax({
		    url: url,
		    type:'GET',
		    timeout: Config.REQUEST_TIMEOUT_SECONDS * 1000,
		    success: function() {
				$("#thumbnail").css("background-image", "url(" + url + ")");
		    },
			error: function()
			{
				onError();
		    }
		});
	} else {
		onError();
	}
};

Graphics.updateEpg = function(id, title) {
	Graphics.delayedAction(Graphics.epgId, function() { Graphics.updateEpg(id, title); }, Graphics.EPG_REFRESH_SECONDS);
	setTimeout(function() {
		var epgDataArray = ServiceClient.getEpgData(id);
		var html = ""; 
		html += Graphics.createProgramlist(title, epgDataArray);
		html += Graphics.createProgramInfo(epgDataArray);
		$(Graphics.epgId).html(html);
		Graphics.showEpg();
	}, 0);
};

Graphics.createProgramlist = function(channel, epgDataArray) {
	var html = "<div class='epgHeader'>Programoversikt " + channel + " [" + TimeAndDate.hoursMinutes(new Date().getTime()) + "]</div>";
	if (epgDataArray.length == 0) {
		html += "<div>&lt;Ingen data&gt;</div>";
	} else {
		for (var i=0; i < epgDataArray.length; i++) {
			var epgData = epgDataArray[i];
			if (epgData.isActive) {
				html += "<div class='epgActive'>";
			} else {
				html += "<div>";
			}
			var title = epgData.title.length > 37 ? epgData.title.substring(0, 35).trim() + "..." : epgData.title;
			html += TimeAndDate.hoursMinutes(epgData.startMillis) + ": " + title;
			html += "</div>";
		}
	}
	return "<div class='epgSub'>" + html + "</div>";
};

Graphics.createProgramInfo = function(epgDataArray) {
	var currentMillis = new Date().getTime();
	for (var i=0; i < epgDataArray.length; i++) {
		var epgData = epgDataArray[i];
		if (epgData.endMillis > currentMillis) {
			var html = "";
			if (epgData.isActive) {
				html += Graphics.createEpgSub(epgData, "Nå");
			} else {
				html += Graphics.createEpgSub(epgData);
			}
			if (i+1 < epgDataArray.length) {
				html += Graphics.createEpgSub(epgDataArray[i+1]);
			}
			return html;
		}
	}
	return "";
};

Graphics.createEpgSub = function(epgData, prefix) {
	if (!prefix) {
		prefix = TimeAndDate.hoursMinutes(epgData.startMillis);
	}
	prefix += ": ";
	var html = 	"<div class='epgSub'>";
	html += 		"<div class='epgHeader'>" + prefix + epgData.title + "</div>";
	var description = epgData.description.trim();
	if (description && description != "") {
		description = description.length > 250 ? description.substring(0, 247).trim() + "..." : description;
		html += 	"<div>" + description + "</div>";
	} else {
		html += 	"<div>Ingen beskrivelse tilgjengelig</div>";
	}
	html += 	"</div>";
	return html;
};

Graphics.showEpg = function() {
	$(Graphics.epgId).css("left", Config.EPG_MENU_OFFSET_LEFT - MenuManager.currentLeft);
	$(Graphics.epgId).show();
};

Graphics.hideEpg = function() {
	Graphics.stopEpgUpdate();
	$(Graphics.epgId).hide();
};

Graphics.stopEpgUpdate = function() {
	clearTimeout(Graphics.timeoutMap[Graphics.epgId]);
};

Graphics.showDescription = function(timeoutSeconds) {
	var description = Player.getCurrentTitle();
	$(Graphics.descriptionId).html(description);

	if (Player.mediaElement.type == MediaElementType.LIVE) {
		setTimeout(function() {
			var title = ServiceClient.getCurrentLiveTitle(Player.mediaElement.id);
			if (title) {
				$(Graphics.descriptionId).html(description + ": " + title);
			}
		}, 0);
	}
	if (!timeoutSeconds) {
		timeoutSeconds = Graphics.DEFAULT_INFO_TIMEOUT_SECONDS;
	}
	$(Graphics.descriptionId).stop();
	$(Graphics.descriptionId).css({ opacity: 1 });
	$(Graphics.descriptionId).show();
	Graphics.delayedAction(Graphics.descriptionId, Graphics.fadeOutDescription, timeoutSeconds);
};

Graphics.fadeOutDescription = function() {
	$(Graphics.descriptionId).fadeOut(Graphics.DISPLAY_FADEOUT_SECONDS * 1000);
};

Graphics.displayDetailsToggle = function() {
	if (!MenuManager.menuVisible) {
		Graphics.detailsEnabled = !Graphics.detailsEnabled;
		Graphics.refreshDetails();
		Graphics.delayedAction(Graphics.detailsId, function() {Graphics.detailsEnabled = false;}, Graphics.DETAIL_TIMEOUT_SECONDS);
	} else {
		Graphics.detailsEnabled = false;
	}
};

Graphics.delayedAction = function(id, delayedAction, seconds) {
	clearTimeout(Graphics.timeoutMap[id]);
	Graphics.timeoutMap[id] = setTimeout(delayedAction, seconds * 1000);
};

Graphics.refreshDetails = function() {
	if (Graphics.detailsEnabled && !MenuManager.menuVisible) {
		var detailsHtml = "supertypo/NRK v" + Main.getVersion() + "<br/>";
		detailsHtml += "------------------------<br/>";
		detailsHtml += "Nåværende hastighet: " + Player.getCurrentBitrateKbps() + " kbps<br/>";
		detailsHtml += "HW:" + Main.getModelCode() + " FW:" + Main.getFirmware() + "<br/>";
		detailsHtml += "<br/>- Pause/Play/Stop: Styrer avspilling<br/>";
		detailsHtml += "- Pil høyre/venstre: Spoler 30 sek fram/bak<br/>";
		detailsHtml += "- Pil opp/ned: Spoler 10 min fram/bak<br/>";
		detailsHtml += "- RW(<<)/FF(>>): Spiller av forrige/neste program<br/>";
		detailsHtml += "- Return/Tools: Viser/lukker hovedmenyen<br/>";
		detailsHtml += "- Rød/Grønn/Gul/Blå: Overstyrer undertekst<br/>";
		detailsHtml += "- Info: Viser/lukker denne informasjonen<br/>";
		detailsHtml += "<br/>Besøk " + Main.URL_HOME + " for informasjon og oppdateringer.<br/>";
		$(Graphics.detailsId).html(detailsHtml);
		$(Graphics.detailsId).show(0, function() {
			$(Graphics.detailsId).css("left", "30px");
		});
		setTimeout(Graphics.refreshDetails, 1000);
	} else {
		$(Graphics.detailsId).css("left", "-510px");
		Graphics.detailsEnabled = false;
	}
};

Graphics.displayDebugToggle = function() {
	Graphics.debugEnabled = !Graphics.debugEnabled;
	Graphics.refreshDebug();
	Graphics.delayedAction(Graphics.debugId, function() {Graphics.debugEnabled = false;}, Graphics.DEBUG_TIMEOUT_SECONDS);
};

Graphics.refreshDebug = function() {
	if (Graphics.debugEnabled) {
		var logHtml = Graphics.htmlFromArray(Logger.logEvents);
		$(Graphics.debugId).html(logHtml);
		$(Graphics.debugId).show(0, function() {
			$(Graphics.debugId).css("top", "0px");
		});
		setTimeout(Graphics.refreshDebug, 1000);
	} else {
		$(Graphics.debugId).css("top", "-710px");
	}
};

Graphics.htmlFromArray = function(array) {
	var html = "";
	for(var i=0; i<array.length; i++) {
		html += "<div class=\"debug_row\">" + array[i] + "</div>";
	}
	return html;
};

Graphics.showPlayerInfo = function(state) {
	Graphics.showPlayerState(state);
	Graphics.showDescription();
	Graphics.showProgress();
};

Graphics.hidePlayerInfo = function() {
	$(Graphics.descriptionId).hide();
	$(Graphics.playerStateId).hide();
	$(Graphics.progressId).hide();
};

Graphics.showPlayerState = function(state, timeoutSeconds) {
	if (state) {
		$(Graphics.playerStateId).html(state);
	}
	var timeout = Graphics.DEFAULT_INFO_TIMEOUT_SECONDS;
	if(timeoutSeconds) {
		timeout = timeoutSeconds;
	}
	$(Graphics.playerStateId).stop();
	$(Graphics.playerStateId).css({ opacity: 1 });
	$(Graphics.playerStateId).show();
	Graphics.delayedAction(Graphics.playerStateId, Graphics.fadeOutState, timeout);
};

Graphics.fadeOutState = function() {
	$(Graphics.playerStateId).fadeOut(Graphics.DISPLAY_FADEOUT_SECONDS * 1000);
};

Graphics.updateProgress = function() {
	$(Graphics.progressId).html(PlayerEventHandler.getPrettyProgress());
};

Graphics.refreshProgress = function() {
	if (Graphics.progressEnabled) {
		$(Graphics.progressId).html(PlayerEventHandler.getPrettyProgress());
		setTimeout(Graphics.refreshProgress, 1000);
	}
};

Graphics.showProgress = function(timeoutSeconds) {
	var timeout = Graphics.DEFAULT_INFO_TIMEOUT_SECONDS;
	if(timeoutSeconds) {
		timeout = timeoutSeconds;
	}
	Graphics.progressEnabled = true;
	$(Graphics.progressId).html(PlayerEventHandler.getPrettyProgress());
	$(Graphics.progressId).stop();
	$(Graphics.progressId).css({ opacity: 1 });
	$(Graphics.progressId).show();
	Graphics.refreshProgress();
	Graphics.delayedAction(Graphics.progressId, Graphics.fadeOutProgress, timeout);
};

Graphics.fadeOutProgress = function() {
	$(Graphics.progressId).fadeOut(Graphics.DISPLAY_FADEOUT_SECONDS * 1000);
	setTimeout(function() { Graphics.progressEnabled = false; }, Graphics.DISPLAY_FADEOUT_SECONDS * 1000); 
};

Graphics.showBuffer = function(html) {
	if (html != null) {
		$(Graphics.bufferId).html(html);
	}
	$(Graphics.bufferId).stop();
	$(Graphics.bufferId).css({ opacity: 1 });
	$(Graphics.bufferId).show();
};

Graphics.hideBuffer = function() {
	Graphics.delayedAction(Graphics.bufferId, Graphics.fadeOutBuffer, Graphics.BUFFER_TIMEOUT_SECONDS);
};

Graphics.fadeOutBuffer = function() {
	$(Graphics.bufferId).fadeOut(Graphics.DISPLAY_FADEOUT_SECONDS * 1000);
};

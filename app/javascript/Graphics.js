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
		timeoutMap : {},
		detailsEnabled : false,
		debugEnabled : false,
		stateEnabled : false,
		progressEnabled : false,
		descriptionId : "#channelDescription",
		detailsId : "#details",
		debugId : "#debug",
		playerStateId : "#state",
		bufferId : "#bufferingProgress",
		progressId : "#timeProgress",
};

Graphics.getDescription = function() {
	return $(Graphics.descriptionId).html();
};

Graphics.showDescription = function(description, timeoutSeconds) {
	if(description) {
		$(Graphics.descriptionId).html(description);
	}
	var timeout = Graphics.DEFAULT_INFO_TIMEOUT_SECONDS;
	if(timeoutSeconds) {
		timeout = timeoutSeconds;
	}
	$(Graphics.descriptionId).stop();
	$(Graphics.descriptionId).css({ opacity: 1 });
	$(Graphics.descriptionId).show();
	Graphics.delayedAction(Graphics.descriptionId, Graphics.fadeOutDescription, timeout);
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
		var detailsHtml = "NRK Nett-TV v" + Main.getVersion() + "<br/>";
		detailsHtml += "------------------------<br/>";
		detailsHtml += "Nåværende hastighet: " + Player.getCurrentBitrateKbps() + " kbps<br/>";
		detailsHtml += "HW:" + Main.getModelCode() + " FW:" + Main.getFirmware() + "<br/>";
		detailsHtml += "<br/>- Pause/Play/Stop: Styrer avspilling<br/>";
		detailsHtml += "- Pil høyre/venstre: Spoler 30 sek fram/bak<br/>";
		detailsHtml += "- Pil opp/ned: Spoler 10 min fram/bak<br/>";
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

Graphics.showPlayerInfo = function(state, description, timeoutSeconds) {
	Graphics.showPlayerState(state, timeoutSeconds);
	Graphics.showDescription(description, timeoutSeconds);
	Graphics.showProgress(timeoutSeconds);
};

Graphics.hidePlayerStateAndProgress = function() {
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

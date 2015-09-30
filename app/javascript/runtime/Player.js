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
var Player = {
	BUFFER_SIZE_TOTAL_MB: 30,
	BUFFER_SIZE_INITIAL_MB: 1,
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2,
	state: 0,
	mediaElement: null
};

Player.init = function() {
	pluginPlayer.SetDisplayArea(0, 0, 1280, 720);
	PlayerEventHandler.register();
};

Player.play = function(mediaElement) {
	if(Player.mediaElement && mediaElement.id == Player.mediaElement.id) {
		PlayerEventHandler.progressSeconds = PlayerEventHandler.currentSeconds;
		PlayerEventHandler.autoJump = true;
	} else {
		PlayerEventHandler.currentSeconds = 0;
		PlayerEventHandler.autoJump = false;
	}
	if(Player.state != Player.STOPPED) {
		Player.stopPlayback();
	}
	Subtitle.loadFile(mediaElement.subtitlesUrl, mediaElement.id);
	Player.mediaElement = mediaElement;
	Player.playVideo();
};

Player.togglePause = function() {
	if (Player.state != Player.STOPPED) {
		if (Player.state == Player.PAUSED) {
			Logger.log("Resuming playback");
			Player.state = Player.PLAYING;
			Graphics.showPlayerInfo(Player.getStateDescription());
			Main.disableScreenSaver();
			pluginPlayer.Resume();
		} else if (Player.state == Player.PLAYING) {
			Logger.log("Pausing playback");
			Player.state = Player.PAUSED;
			Graphics.showPlayerInfo(Player.getStateDescription());
			Main.enableScreenSaver();
			pluginPlayer.Pause();
		}
	}
};

Player.playVideo = function() {
	if (Player.state == Player.STOPPED) {
		MenuManager.hideMenu();
		Background.hide();
		Update.hide();
		PlayerEventHandler.reset();
		Player.startPlayback();
	} else {
		Player.togglePause();
	}
};

Player.startPlayback = function() {
	if(Player.mediaElement && Player.mediaElement.mediaUrl) {
		var mediaUrl = Player.mediaElement.mediaUrl;
		Player.state = Player.PLAYING;
//		PlayerEventHandler.OnBufferingComplete(); // TESTING WITHOUT PLAYBACK
		if(Main.isModernFirmware()) {
			var parms;
			if (WebParserNg.isRadio(Player.mediaElement.url)) {
				parms = "|STARTBITRATE=64000|COMPONENT=HLS";
			} else {
				parms = "|STARTBITRATE=1000000|COMPONENT=HLS";
			}
			Logger.log("Starting playback of: " + mediaUrl + parms);
			pluginPlayer.InitPlayer(mediaUrl + parms);
			Player.setBufferSizes();
			pluginPlayer.StartPlayback();
		} else {
			var parms;
			if (Player.mediaElement.type == MediaElementType.LIVE && !WebParserNg.isRadio(Player.mediaElement.url)) {
				parms = "|STARTTIME=02:55:00|BITRATES=(2200000~3000000)|COMPONENT=HLS";
			} else {
				parms = "|STARTBITRATE=1000000|COMPONENT=HLS";
			}
			Logger.log("Starting playback of: " + mediaUrl + parms);
			pluginPlayer.Play(mediaUrl + parms);
		}
		Subtitle.reset();
		Main.disableScreenSaver();
	}
};

Player.stopVideo = function() {
	Player.stopPlayback();
	Graphics.hidePlayerInfo();
	Graphics.hideBuffer();
	Background.show();
	MenuManager.showMenu();
};

Player.stopPlayback = function() {
	Logger.log("Stopping playback");
	Player.state = Player.STOPPED;
	pluginPlayer.Stop();
	Main.enableScreenSaver();
	Subtitle.reset();
};

Player.jumpForward = function(seconds) {
	if (Player.state != Player.STOPPED) {
		Graphics.showPlayerInfo("+" + Player.prettyfyJump(seconds));
		pluginPlayer.JumpForward(seconds);
		Subtitle.reset();
	}
};

Player.jumpBackward = function(seconds) {
	if (Player.state != Player.STOPPED) {
		Graphics.showPlayerInfo("-" + Player.prettyfyJump(seconds));
		pluginPlayer.JumpBackward(seconds);
		Subtitle.reset();
	}
};

Player.prettyfyJump = function(seconds) {
	var remainder = seconds;
	var s = Math.floor(remainder % 60);
	if (s < 10) {
		s = "0" + s;
	}
	var m = Math.floor(remainder / 60);
	return  m + ":" + s;
};

Player.setBufferSizes = function() {
	try {
		pluginPlayer.SetTotalBufferSize(Player.BUFFER_SIZE_TOTAL_MB * 1024 * 1024);
		Logger.log("SetTotalBufferSize(" + Player.BUFFER_SIZE_TOTAL_MB + "MB) successful");
	} catch(error) {
		Logger.log("SetTotalBufferSize(" + Player.BUFFER_SIZE_TOTAL_MB + "MB) failed, see the following message for details:");
		Logger.log(error.message);
	}
//	try {
//		pluginPlayer.SetInitialBuffer(Player.BUFFER_SIZE_INITIAL_MB * 1024 * 1024);
//		Logger.log("SetInitialBuffer(" + Player.BUFFER_SIZE_INITIAL_MB + "MB) successful");
//	} catch(error) {
//		Logger.log("SetInitialBuffer(" + Player.BUFFER_SIZE_INITIAL_MB + "MB) failed, see the following message for details:");
//		Logger.log(error.message);
//	}
//	try {
//		pluginPlayer.SetPendingBuffer(Player.BUFFER_SIZE_INITIAL_MB * 1024 * 1024);
//		Logger.log("SetPendingBuffer(" + Player.BUFFER_SIZE_INITIAL_MB + "MB) successful");
//	} catch(error) {
//		Logger.log("SetPendingBuffer(" + Player.BUFFER_SIZE_INITIAL_MB + "MB) failed, see the following message for details:");
//		Logger.log(error.message);
//	}
};

Player.getStateDescription = function() {
	if (Player.state == Player.STOPPED) {
		return "Stopp";
	} else if (Player.state == Player.PAUSED) {
		return "Pause";
	} else if (Player.state == Player.PLAYING) {
		return "Spiller av";
	}
};

Player.getCurrentBitrateKbps = function() {
	var current = pluginPlayer.GetCurrentBitrates();
	if (current != null && typeof(current) === "number" && current > 0) {
		return Math.round((current / 1000));
	} 
	return 0;
};

Player.getCurrentTitle = function() {
	return Player.mediaElement ? Player.mediaElement.title : null;
};

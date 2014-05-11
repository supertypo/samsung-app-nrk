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
var Player = {
	BUFFER_SIZE_TOTAL_MB: 30,
	BUFFER_SIZE_INITIAL_MB: 1,
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2,
	state: 0,
	currentUrl: null,
	playerParams: "|STARTBITRATE=1500000|COMPONENT=HLS",
	oldPlayerParams: "|STARTTIME=02:55:00|STARTBITRATE=1500000|COMPONENT=HLS"
};

Player.init = function() {
	pluginPlayer.SetDisplayArea(0, 0, 1280, 720);
	PlayerEventHandler.register();
};

Player.changeChannel = function(url) {
	if(url == Player.currentUrl) {
		PlayerEventHandler.progressSeconds = PlayerEventHandler.currentSeconds;
		PlayerEventHandler.autoJump = true;
	}
	if(Player.state != Player.STOPPED) {
		Player.stopPlayback();
	}
	Player.currentUrl = url;
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
	if(Player.currentUrl != null) { 
		Player.state = Player.PLAYING;
		if(Main.isModernFirmware()) {
			Logger.log("Starting playback of: " + Player.currentUrl + Player.playerParams);
			pluginPlayer.InitPlayer(Player.currentUrl + Player.playerParams);
			Player.setBufferSizes();
			pluginPlayer.StartPlayback();
		} else {
			Logger.log("Starting playback of: " + Player.currentUrl + Player.oldPlayerParams);
			pluginPlayer.Play(Player.currentUrl + Player.oldPlayerParams);
		}
		Subtitle.init();
		Main.disableScreenSaver();
	}
};

Player.stopVideo = function() {
	Player.stopPlayback();
	Graphics.showDescription(MenuManager.MENU_DESCRIPTION, MenuManager.INFO_TIMEOUT_SECONDS);
	Graphics.hidePlayerStateAndProgress();
	Graphics.hideBuffer();
	Background.show();
	MenuManager.showMenu();
};

Player.stopPlayback = function() {
	Logger.log("Stopping playback");
	Player.state = Player.STOPPED;
	pluginPlayer.Stop();
	Main.enableScreenSaver();
	Subtitle.hide();
};

Player.jumpForward = function(seconds) {
	if (Player.state != Player.STOPPED) {
		Subtitle.init();
		Graphics.showPlayerInfo("+" + Player.prettyfyJump(seconds));
		pluginPlayer.JumpForward(seconds);
	}
};

Player.jumpBackward = function(seconds) {
	if (Player.state != Player.STOPPED) {
		Subtitle.init();
		Graphics.showPlayerInfo("-" + Player.prettyfyJump(seconds));
		pluginPlayer.JumpBackward(seconds);
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
